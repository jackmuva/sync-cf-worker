import { Env, RequestBody } from "./req-utils";
import { fileTypeFromBuffer } from "file-type";

interface SyncedRecords {
	data: Array<any>,
	paging: {
		total_records: number,
		remaining_records: number,
		cursor: string,
		last_seen: string,
	},
}

export const pullSyncedRecords = async (user: string, env: Env, body: RequestBody, headers: Headers, cursor?: string): Promise<Array<string>> => {
	let erroredRecords: Array<string> = []


	const recordRequest = await fetch(env.MANAGED_SYNC_API + `/sync/${body.id}/records?pageSize=100&${cursor ? `cursor=${cursor}` : ""}`, {
		method: "GET",
		headers: headers,
	});
	const recordResponse: SyncedRecords = await recordRequest.json();
	for (const data of recordResponse.data) {
		const indexResponse = await indexRecordContent(user, env, headers, body.id!, data.id);
		if (!indexResponse.success && indexResponse.erroredRecord) {
			erroredRecords.push(indexResponse.erroredRecord);
		}
	}
	if (recordResponse.paging.remaining_records > 0) {
		// WARNING: token in header may expire, may be worth having a refresh token method
		let newErroredRecords: Array<string> = await pullSyncedRecords(user, env, body, headers, recordResponse.paging.cursor);
		erroredRecords = erroredRecords.concat(newErroredRecords);
	}
	return erroredRecords;
}

const indexRecordContent = async (user: string, env: Env, headers: Headers, syncId: string, recordId: string): Promise<{ success: boolean, erroredRecord?: string }> => {
	const contentRequest = await fetch(env.MANAGED_SYNC_API + `/sync/${syncId}/records/${recordId}/content`,
		{
			method: "GET",
			headers: headers,
		});

	// FIX: will need to rework when we now the schema for the content that's returned
	const content = await contentRequest.arrayBuffer();
	const filetype = await fileTypeFromBuffer(content);
	const key = user + "/" + recordId + "." + (filetype?.ext !== undefined ? filetype?.ext : "");
	try {
		const r2Object = await env.SYNC_BUCKET.put(key, content);
		if (r2Object?.key) {
			return { success: true }
		}
		return { success: false, erroredRecord: recordId };
	} catch (err) {
		console.error(`[INDEX] unable to index record ${recordId}: ${err}`)
		return { success: false, erroredRecord: recordId };
	}
}

