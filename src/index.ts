import puppeteer from "@cloudflare/puppeteer";
import { Env, validateRequest, RequestBody } from "./req-utils";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const valid = validateRequest(request, env.SIGNING_KEY);

		if (!valid.valid) {
			return new Response(valid.message, {
				status: valid.status,
			});
		}

		const user = valid.user;
		const body = (await request.json()) as RequestBody;
		const targetUrl = new URL(body.url);

		const browser = await puppeteer.launch(env.MY_BROWSER);
		const page = await browser.newPage();

		await page.goto(targetUrl.href);
		const htmlPage = await page.content();

		const key = user + "/" + targetUrl.hostname + "_" + Date.now() + ".html";
		await env.SYNC_BUCKET.put(key, htmlPage);

		await browser.close();

		return new Response(
			JSON.stringify({
				success: true,
				message: "Page rendered and stored successfully",
				key: key,
			}),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	},
} satisfies ExportedHandler<Env>;
