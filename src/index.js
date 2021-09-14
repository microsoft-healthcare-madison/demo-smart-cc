// See: https://sometimes-react.medium.com/jwks-and-node-jose-9273f89f9a02
// See: https://github.com/HL7/smart-app-launch/blob/add-backend-services/input/pages/client-confidential-asymmetric.md
import axios from 'axios';
import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import jose from 'node-jose';
import pkce from 'pkce-challenge';
import uuid from 'uuid';
import nunjucks from 'nunjucks';
import session from 'express-session';

const app = express();

const CLIENT_ID = process.env.CLIENT_ID ||  'demo confidential client id';
const CLIENT_ID_CC = process.env.CLIENT_ID_CC // || 'demo M2M client id';
const KEYS = 'demo.keys';
const KEYS_CC = 'demo.cc_keys'; //client credential flow keys
const PKCE = true;
const PORT = process.env.PORT || 2021;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const SCOPES = process.env.SCOPES || 'launch openid fhirUser';
const SCOPES_CC = process.env.SCOPES_CC || 'user/*.*';
const SECRET = process.env.SECRET || 'This is something unlikely to occurr by chance.';
const SECURE = process.env.SECURE || !PUBLIC_URL.startsWith('http://localhost:');

app.use(cors({ origin: true, credentials: true }));
app.set('json spaces', 2);
app.set('trust proxy', 1);
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: SECURE,
    httpOnly: true,
  }
}));

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

function setupKeys(filename) {
  fs.stat(filename, async (err, status) => {
    if (err) {
      console.info('Creating new keys in:', filename);
      const keyStore = jose.JWK.createKeyStore();
      await keyStore.generate('RSA', 2048, {alg: 'RS384', use: 'sig' });
      await keyStore.generate('EC', 'P-384', {alg: 'ES384', use: 'sig' });
      fs.writeFileSync(
        filename,
        JSON.stringify(keyStore.toJSON(true), null, '  ')
      );
    } else {
      console.info('Found existing keys in:', filename);
    }
  });
}
setupKeys(KEYS);
setupKeys(KEYS_CC);

async function getSignedJwt(aud, clientId, keyFile) {
  const [key] = (await getKeyStore(keyFile)).all({ use: 'sig' });
  const opt = { compact: true, jwk: key, fields: { typ: 'JWT' } }
  const payload = JSON.stringify({
    iss: clientId,
    sub: clientId,
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

async function sendPostRequest(token_url, params) {
  const payload = new URLSearchParams(params).toString();
  const post = await axios.post(token_url, payload, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    }
  });
  if (post.headers) {
    // Sanity check the response headers.
    const err = 'incorrect response header when receiving an access token';
    if (post.headers['cache-control'] !== 'no-store') {
      console.warn(`${err}: cache-control !== no-store`);
    }
    if (post.headers['pragma'] !== 'no-cache') {
      console.warn(`${err}: pragma != no-cache`);
    }
  }
  return post.data;
}

// Used to get a token using the authorization code flow.
async function getTokenAuthFlow(session, code) {
  const token_url = session.meta.token_endpoint;
  const params = {
    client_assertion: await getSignedJwt(token_url, CLIENT_ID, KEYS),
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    code: code,
    code_verifier: session.pkceVerifier,
    grant_type: 'authorization_code',
    redirect_uri: session.authzParams.redirect_uri,
  }
  return sendPostRequest(token_url, params);
}

// Used to get a token using the client credentials flow.
async function getClientCredentialToken(session) {
  const token_url = session.meta.token_endpoint;
  const params = {
    client_assertion: await getSignedJwt(token_url, CLIENT_ID_CC, KEYS_CC),
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    grant_type: 'client_credentials',
    scope: SCOPES_CC,
  }
  return sendPostRequest(token_url, params);
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
  const algs = meta.token_endpoint_auth_signing_alg_values_supported || [];
  if (!algs.includes('RS384') && !algs.includes('ES384')) {
    console.error('Required signing algorithm (RS384 or ES384) not found!');
    console.debug('Supported signing algorithms:', algs);
  }

  // Build up the parameters needed to be passed to the authz endpoint.
  const authzParams = {
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: `${PUBLIC_URL}/authorized`,
    scope: SCOPES,
    state: uuid.v4(),
    aud: req.query.iss,
  };

  // If this app was launched in the EHR flow, there will be a launch
  // parameter that must be passed through to the authz endpoint.
  if (req.query.launch) {
    authzParams['launch'] = req.query.launch;
  }

  // If PKCE is enabled, generate a challenge and verifier using 128 bits of
  // entropy and save it in the session state.
  let pkceVerifier = null;
  if (PKCE) {
    const { code_challenge, code_verifier } = pkce(128);
    authzParams['code_challenge_method'] = 'S256';
    authzParams['code_challenge'] = code_challenge;
    pkceVerifier = code_verifier;
  }
  req.session.oauth_state = authzParams.state;
  req.session.oauth_parameters = {meta, pkceVerifier, authzParams};
  const url = new URL(meta.authorization_endpoint).toString();
  const qs = new URLSearchParams(authzParams).toString();
  res.redirect(`${url}?${qs}`);
});

app.get('/authorized', async (req, res) => {
  // See https://hl7.org/fhir/uv/bulkdata/authorization/index.html#protocol-details for asymm auth
  const state = req.query.state;
  const originalState = req.session.oauth_state;
  const session = req.session.oauth_parameters;
  var token = ''
  var ccToken = ''
  if (state === originalState) {
    token = await getTokenAuthFlow(session, req.query.code);
    if (CLIENT_ID_CC) {
      ccToken = await getClientCredentialToken(session);
    }
  }
  else {
    token = 'Error: The state parameter was invalid!';
  }

  res.render('authorized.html', {token: JSON.stringify(token), cc_token: JSON.stringify(ccToken)})
});

app.get('/jwks.json', async (req, res) => {
  res.send((await getKeyStore(KEYS)).toJSON());
});

app.get('/jwks_cc.json', async (req, res) => {
  res.send((await getKeyStore(KEYS_CC)).toJSON());
});

app.get('/', async (req, res) => {
  const keys = (await getKeyStore(KEYS)).toJSON()
  const keys_cc = (await getKeyStore(KEYS_CC)).toJSON()

  res.render('index.html', {
    client_id: CLIENT_ID,
    client_id_cc: CLIENT_ID_CC,
    public_url: PUBLIC_URL,
    scopes: SCOPES,
    scopes_cc: SCOPES_CC
  });
})


app.listen(PORT, () => {
  console.log(`Demo Confidential Client listening on port ${PORT}!`);
  console.log(`  ${PUBLIC_URL}/jwks.json`);
  console.log(`  ${PUBLIC_URL}/launch`);
  console.log(`  ${PUBLIC_URL}/authorized`);
});
