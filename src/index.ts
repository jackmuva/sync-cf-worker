import puppeteer from "@cloudflare/puppeteer";

// Define our environment bindings
interface Env {
	MY_BROWSER: any;
	SYNC_BUCKET: R2Bucket;
}

// Define request body structure
interface RequestBody {
	url: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method !== "POST") {
			return new Response("Please send a POST request with a target URL", {
				status: 405,
			});
		}

		const body = (await request.json()) as RequestBody;
		const targetUrl = new URL(body.url);

		const browser = await puppeteer.launch(env.MY_BROWSER);
		const page = await browser.newPage();

		await page.goto(targetUrl.href);
		const htmlPage = await page.content();

		const key = targetUrl.hostname + "_" + Date.now() + ".html";
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
