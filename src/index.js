// See: https://sometimes-react.medium.com/jwks-and-node-jose-9273f89f9a02
// See: https://github.com/HL7/smart-app-launch/blob/add-backend-services/input/pages/client-confidential-asymmetric.md

import axios from 'axios';
import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import jose from 'node-jose';
import sha256 from 'crypto-js/sha256.js';
import uuid from 'uuid';

const app = express();

const CLIENT_ID = 'demo confidential client id';
const KEYS = '/tmp/demo.keys';
const PKCE = true;
const PORT = 2021;
const SESSIONS = new Map();

app.use(cors({ origin: true, credentials: true }));
app.set('json spaces', 2);


function setupKeys(filename) {
  fs.stat(filename, (err, status) => {
    if (err) {
      console.debug('setting up keys for:', filename);
      const keyStore = jose.JWK.createKeyStore();
      keyStore
      // how to do multiple hashing algorithms and signing keys?
      .generate('RSA', 2048, {alg: 'RS384', use: 'sig' })
      //.generate('EC', 'P-384', {alg: 'P-384', use: 'sig' })
        .then(result => {
            console.debug('result:', result);
            fs.writeFileSync(
              filename,
              JSON.stringify(keyStore.toJSON(true), null, '  ')
            )
          });
    } else {
      console.debug(`FOUND KEYS in ${filename}:`, status);
    }
  });
}
setupKeys(KEYS);


async function getSignedJwt(aud) {
  const [key] = (await getKeyStore(KEYS)).all({ use: 'sig' });
  const opt = { compact: true, jwk: key, fields: { typ: 'JWT' } }
  const payload = JSON.stringify({
    iss: CLIENT_ID,
    sub: CLIENT_ID,
    aud: aud,
    exp: Math.floor(Date.now() / 1000 + 5*60),
    jti: uuid.v4(),
  });
  return await jose.JWS.createSign(opt, key)
    .update(payload)
    .final();
}

async function getKeyStore(keyFile) {
  const ks = fs.readFileSync(keyFile);
  return await jose.JWK.asKeyStore(ks.toString());
}


async function getToken(session, code) {
  const token_url = session.meta.token_endpoint;
  const params = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: session.authz.redirect_uri,
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: await getSignedJwt(token_url),
  }
  if (PKCE) {
    params['code_verifier'] = session.meta.pkce_code_verifier;
  }
  const payload = new URLSearchParams(params).toString();
  const post = await axios.post(token_url, payload, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    }
  });
  if (post.headers) {
    // Sanity check the response headers.
    const err = "incorrect response header when receiving an access token";
    if (post.headers['cache-control'] !== "no-store") {
      console.warn(`${err}: cache-control !== no-store`);
    }
    if (post.headers['pragma'] !== "no-cache") {
      console.warn(`${err}: pragma != no-cache`);
    }
  }
  return post.data;
}


app.get('/launch', async (req, res) => {
  // Read the SMART configuration from the FHIR server to get the authz
  // endpoints (as well as the token and introspection endpoints (and more)).
  const meta = await fetch(`${req.query.iss}/.well-known/smart-configuration`)
    .then(r => r.json())
    .catch(console.error);

  // Check for required capabilities.
  const capability = 'client-confidential-asymmetric';
  if (!meta.capabilities.includes(capability)) {
    console.error(`Capability '${capability}' not found in ${req.query.iss}`);
    console.debug(`Capabilities of ${req.query.iss} are:`, meta.capabilities);
  }
  const method = 'private_key_jwt';
  const methods = meta.token_endpoint_auth_methods_supported;
  if (!methods.includes(method)) {
    console.error(req.query.iss, `token endpoint must support '${method}'`);
    console.debug('Supported methods:', methods);
  }

  // Build up the parameters needed to be passed to the authz endpoint.
  const params = {
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: 'http://localhost:2021/authorized',
    scope: 'launch openid fhirUser',  // TODO: customize this?
    state: uuid.v4(),
    aud: req.query.iss,
  };

  // If this app was launched in the EHR flow, there will be a launch
  // parameter that must be passed through to the authz endpoint.
  if (req.query.launch) {
    params['launch'] = req.query.launch;
  }

  // If PKCE is enabled, generate a challenge using a high-entropy random
  // string, such as a uuid, and save it in the session state.
  if (PKCE) {
    meta['pkce_code_verifier'] = uuid.v4();
    params['code_challenge_method'] = 'S256';
    params['code_challenge'] = btoa(sha256(meta.pkce_code_verifier));
  }
  SESSIONS.set(params.state, {meta: meta, authz: params});
  const url = new URL(meta.authorization_endpoint).toString();
  const qs = new URLSearchParams(params).toString();
  res.redirect(`${url}?${qs}`);
});


app.get('/authorized', async (req, res) => {
  // See https://hl7.org/fhir/uv/bulkdata/authorization/index.html#protocol-details for asymm auth
  const state = req.query.state;
  const session = SESSIONS.get(state);
  const token = await getToken(session, req.query.code);
  session['token'] = token;

  // TODO: use the bearer token to do something on the FHIR server.
});


app.get('/jwks.json', async (req, res) => {
  const jwt = await getSignedJwt();
  console.log(jwt)
  res.send((await getKeyStore(KEYS)).toJSON());
});


app.listen(PORT, () => {
  console.log(`Demo Confidential Client listening on port ${PORT}!`);
  console.log(`  http://localhost:${PORT}/jwks.json`);
  console.log(`  http://localhost:${PORT}/launch`);
  console.log(`  http://localhost:${PORT}/authorized`);
});
