import { pullSyncedRecords } from "./sync-utils";
import { Env, RequestBody, validateRequest } from "./req-utils";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const valid = validateRequest(request, env.SIGNING_KEY);

		if (!valid.valid || !valid.user) {
			return new Response(valid.message, {
				status: valid.status,
			});
		}

		const user = valid.user;
		const body = (await request.json()) as RequestBody;
		try {
			if (!body.id) {
				console.error("need sync id");
				throw new Error("missing sync id");
			}
			//HACK:using a hardcoded jwt for testing
			//switch out for the commented code for more production implementation

			//const erroredRecords = await pullSyncedRecords(user, env, body, request.headers);
			const erroredRecords = await pullSyncedRecords(user, env, body, new Headers({ "Authorization": `Bearer ${env.MANAGED_SYNC_TESTING_JWT}` }));

			return new Response(
				JSON.stringify({
					success: true,
					message: `synced records stored successfully for sync run : ${body.id}`,
					erroredRecords: erroredRecords,
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (err) {
			console.error(`[SYNC] Unable to pull synced records`);
			return new Response(
				JSON.stringify({
					success: false,
					message: `unable to pull synced records for ${body.id}`,
				})
			);
		}
	},
} satisfies ExportedHandler<Env>;
