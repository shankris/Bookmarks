Usage

Full update (overwrite all screenshots):
npm run screenshots

Add missing only:
npm run screenshots -- --fill



Notes

Node 20 has native fetch, so no need to install node-fetch.
Screenshots saved in public/screenshots as domain-xyz.png.
YouTube videos automatically use max resolution if available, fallback to HQ.
Concurrency defaults to 2 for Windows safety.
RETRIES = 1 ensures each URL is retried once if it fails.


