# demo-smart-cc
A demonstration SMART confidential client for testing the new features of the SMARTv2 launch protocols.

## Static Hosting

A copy of this demo is hosted on Glitch at:
[https://proud-wooden-payment.glitch.me/](https://proud-wooden-payment.glitch.me/)

## Testing

You can test the static hosted demo against the SMART app launcher fork found here:
[https://smart.argo.run](https://smart.argo.run)

### Example Test

Expand the new options panel.  These options are intended to represent values which would normally be configured once when an app is first registered with an EHR.

![image](https://user-images.githubusercontent.com/4342684/132779863-7f5ee71b-b65e-49d7-a3ee-ecc45722970b.png)

Field | Selection or Value
------|-------------------
Client Identity Validation Method | client-confidential-asymmetric
Redirect URIs | https://proud-wooden-payment.glitch.me/authorized
JWKS URI | https://proud-wooden-payment.glitch.me/jwks.json
JWKS Inline | *Clear this field after populating a jwks.json uri above and it will automatically populate using the link.*

After setting these values, enter a launch URI in the bottom configuration panel.

![image](https://user-images.githubusercontent.com/4342684/132780341-ddeed561-dbac-4166-bc27-2c0d36dab13e.png)

| Launch URI |
| --- |
| https://proud-wooden-payment.glitch.me/launch/ |

![image](https://user-images.githubusercontent.com/4342684/132780404-317f37ec-4b99-4b35-8055-c8b1b00e9e9e.png)

### Link

[This link](https://smart.argo.run/?auth_error=&client_secret=&fhir_version_2=r4&iss=&jwks=%7B%0A%20%20%22keys%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22kty%22%3A%20%22RSA%22%2C%0A%20%20%20%20%20%20%22kid%22%3A%20%22OFXD5Yms54i3TyKarYcvfZLaRwUaIWuLQNAnacBw_cw%22%2C%0A%20%20%20%20%20%20%22use%22%3A%20%22sig%22%2C%0A%20%20%20%20%20%20%22alg%22%3A%20%22RS384%22%2C%0A%20%20%20%20%20%20%22e%22%3A%20%22AQAB%22%2C%0A%20%20%20%20%20%20%22n%22%3A%20%22yFri1s9ubMd3bzpzUNmTn5f9jn-MfOexYNV0ZzRypojxNOObrd0QVSEuLt2IAeziz7PPvuMzNRii9EmIc1NSdxi6XSSXPDrAJVv3rGmBFnDXaFvF7Zc2ExHh32oFxUrakzgxPuhmoubbR_cULbyZOqcfClmH29t6Gm0DfJ9M1HpF5P2kaYhDbuyIOpkQ6HMua7E-a3VLf_cwAsb6zgHDjN_WCQd6jXRaazbZCnxZo3XBwVNeAMD5h8_TIUm_-FrVSrgdWV1zvQlEPNlHj0vpUoDHISRL46rIBHhgOlujOEqZZNg9g_HlaQZLjxp1vt0Ax-m7kPM7YN16FQbX5oGi1w%22%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22kty%22%3A%20%22EC%22%2C%0A%20%20%20%20%20%20%22kid%22%3A%20%22lYDloO0c6mAGGIlzkpPzBsAPsi1qJwq7xjD36Jqr7X8%22%2C%0A%20%20%20%20%20%20%22use%22%3A%20%22sig%22%2C%0A%20%20%20%20%20%20%22alg%22%3A%20%22P-384%22%2C%0A%20%20%20%20%20%20%22crv%22%3A%20%22P-384%22%2C%0A%20%20%20%20%20%20%22x%22%3A%20%22VIYpEOKEH6AMRlSMcmM1l1VS2OmafM0mJRB2R_2ZLM2IAPIZm3et-Qe-MBoWzxI6%22%2C%0A%20%20%20%20%20%20%22y%22%3A%20%22QSaJShDlSVszsosRPXP5Lw5SZKXbsmB11YhkO5oJjWtCJktojKGtEoVdn7X_4ahM%22%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D&jwks_uri=https%3A%2F%2Fproud-wooden-payment.glitch.me%2Fjwks.json&launch_ehr=1&launch_url=https%3A%2F%2Fproud-wooden-payment.glitch.me%2Flaunch%2F&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&redirect_uris=https%3A%2F%2Fproud-wooden-payment.glitch.me%2Fauthorized&sde=&sim_ehr=1&token_lifetime=15&user_pt=&validate_pkce=1&validation_method=cc-asym) encodes all of the aforementioned parameters.
```html
https://smart.argo.run/?auth_error=&client_secret=&fhir_version_2=r4&iss=&jwks=%7B%0A%20%20%22keys%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22kty%22%3A%20%22RSA%22%2C%0A%20%20%20%20%20%20%22kid%22%3A%20%22OFXD5Yms54i3TyKarYcvfZLaRwUaIWuLQNAnacBw_cw%22%2C%0A%20%20%20%20%20%20%22use%22%3A%20%22sig%22%2C%0A%20%20%20%20%20%20%22alg%22%3A%20%22RS384%22%2C%0A%20%20%20%20%20%20%22e%22%3A%20%22AQAB%22%2C%0A%20%20%20%20%20%20%22n%22%3A%20%22yFri1s9ubMd3bzpzUNmTn5f9jn-MfOexYNV0ZzRypojxNOObrd0QVSEuLt2IAeziz7PPvuMzNRii9EmIc1NSdxi6XSSXPDrAJVv3rGmBFnDXaFvF7Zc2ExHh32oFxUrakzgxPuhmoubbR_cULbyZOqcfClmH29t6Gm0DfJ9M1HpF5P2kaYhDbuyIOpkQ6HMua7E-a3VLf_cwAsb6zgHDjN_WCQd6jXRaazbZCnxZo3XBwVNeAMD5h8_TIUm_-FrVSrgdWV1zvQlEPNlHj0vpUoDHISRL46rIBHhgOlujOEqZZNg9g_HlaQZLjxp1vt0Ax-m7kPM7YN16FQbX5oGi1w%22%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22kty%22%3A%20%22EC%22%2C%0A%20%20%20%20%20%20%22kid%22%3A%20%22lYDloO0c6mAGGIlzkpPzBsAPsi1qJwq7xjD36Jqr7X8%22%2C%0A%20%20%20%20%20%20%22use%22%3A%20%22sig%22%2C%0A%20%20%20%20%20%20%22alg%22%3A%20%22P-384%22%2C%0A%20%20%20%20%20%20%22crv%22%3A%20%22P-384%22%2C%0A%20%20%20%20%20%20%22x%22%3A%20%22VIYpEOKEH6AMRlSMcmM1l1VS2OmafM0mJRB2R_2ZLM2IAPIZm3et-Qe-MBoWzxI6%22%2C%0A%20%20%20%20%20%20%22y%22%3A%20%22QSaJShDlSVszsosRPXP5Lw5SZKXbsmB11YhkO5oJjWtCJktojKGtEoVdn7X_4ahM%22%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D&jwks_uri=https%3A%2F%2Fproud-wooden-payment.glitch.me%2Fjwks.json&launch_ehr=1&launch_url=https%3A%2F%2Fproud-wooden-payment.glitch.me%2Flaunch%2F&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&redirect_uris=https%3A%2F%2Fproud-wooden-payment.glitch.me%2Fauthorized&sde=&sim_ehr=1&token_lifetime=15&user_pt=&validate_pkce=1&validation_method=cc-asym
```

## Building Locally

Feel free to use this demo as a starting point or learning tool.

Clone the repo and select a compatible version of `npm`.

```bash
nvm use 16
npm ci
npm run start
```

You should see output similar to this.

```bash
can@msft-mbp ~/code/test/demo-smart-cc (main) $ nvm use 16
Now using node v16.5.0 (npm v7.19.1)


can@msft-mbp ~/code/test/demo-smart-cc (main) $ npm ci
npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.

added 73 packages, and audited 74 packages in 1s

6 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities


can@msft-mbp ~/code/test/demo-smart-cc (main) $ npm run start

> demo-smart-cc@0.1.0 start
> node ./src/index.js

(node:76356) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Demo Confidential Client listening on port 2021!
  http://localhost:2021/jwks.json
  http://localhost:2021/launch
  http://localhost:2021/authorized
Creating new keys in: demo.keys
```
