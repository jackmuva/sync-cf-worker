# Sync Cloudflare Worker

## Setup
* if r2 bucket isn't create use `npx wrangler r2 bucket create <bucket-name>`
* use `npx wrangler deploy` to deploy to cloudflare worker
* use this command to test
```
curl -X POST https://sync-cf-worker.jack-mu.workers.dev \
-H "Content-Type: application/json" \
-d '{"url": "https://developers.cloudflare.com/autorag/tutorial/brower-rendering-autorag-tutorial/"}'
```
