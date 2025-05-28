# Sync Cloudflare Worker

## Setup
* if r2 bucket isn't create use `npx wrangler r2 bucket create <bucket-name>`
* fill in the `wrangler.jsonc` file with appropriate bucket names and env variables
* use `npx wrangler deploy` to deploy to cloudflare worker
* use this command to test
```
curl -X POST https://sync-cf-worker.<YOUR_DOMAIN>.workers.dev \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{"url": "https://developers.cloudflare.com/autorag/tutorial/brower-rendering-autorag-tutorial/"}'
```
* current `index.ts` is using a webscraping implementation while **managed sync** is being developed
	* `sync-index.ts` can be used when **managed sync** is ready for testing
