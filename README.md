# demo-smart-cc
A demonstration SMART confidential client for testing the new features of the SMARTv2 launch protocols.

## Building Locally

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
