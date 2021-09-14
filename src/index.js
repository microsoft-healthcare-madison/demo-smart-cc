// See: https://sometimes-react.medium.com/jwks-and-node-jose-9273f89f9a02
// See: https://github.com/HL7/smart-app-launch/blob/add-backend-services/input/pages/client-confidential-asymmetric.md
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import fhirClient from 'fhirclient/dist/lib/entry/node.js';
import fs from 'fs';
import jose from 'node-jose';

const app = express();

const CLIENT_ID = 'demo confidential client id';
const KEYS = 'demo.keys';
const PORT = process.env.PORT || 2021;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

app.set('trust proxy', 1) // trust first proxy
app.set('json spaces', 2);

app.use(cors({ origin: true, credentials: true }));
app.use(session({
    secret: 'not-really-secret-replace-me',
    cookie: {
      secure: true,
      sameSite: 'none'
    }
}));

function setupKeys(filename = KEYS) {
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

async function getKeyStore(keyFile = KEYS) {
  return JSON.parse(fs.readFileSync(keyFile).toString());
}

app.get('/launch', async (req, res) => {
  const {launch, iss} = req.query;
  const clientPrivateJwk = (await getKeyStore()).keys.filter(k => k.alg === 'ES384')[0]
  await fhirClient(req, res).authorize({
    clientId: CLIENT_ID,
    clientPrivateJwk,
    iss,
    launch,
    redirectUri: `${PUBLIC_URL}/authorized`,
    scope: 'launch openid fhirUser',
  });
});

app.get('/authorized', async (req, res) => {
  try {
    let client = await fhirClient(req, res).ready();
    res.json(client.state.tokenResponse)
  } catch(e) {
    res.json({error: e})
  }
});

app.get('/jwks.json', async (req, res) => {
  res.json(await getKeyStore());
});


app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Demo SMART Confidential Client</h1>
        <p>View Source:
        <a 
          href="https://github.com/microsoft-healthcare-madison/demo-smart-cc"
          target="_blank"
          rel="noopener noreferrer"
        >https://github.com/microsoft-healthcare-madison/demo-smart-cc</a>
      </body>
    </html>
  `);
})

app.listen(PORT, () => {
  console.log(`Demo Confidential Client listening on port ${PORT}!`);
  console.log(`  ${PUBLIC_URL}/jwks.json`);
  console.log(`  ${PUBLIC_URL}/launch`);
  console.log(`  ${PUBLIC_URL}/authorized`);
});