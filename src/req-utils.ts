var jwt = require('jsonwebtoken');
// TODO: npm install types/jsonwebtoken
//import jwt from "jsonwebtoken";

export interface Env {
	MY_BROWSER: any;
	SYNC_BUCKET: R2Bucket;
	SIGNING_KEY: string;
	MANAGED_SYNC_API: string;
	MANAGED_SYNC_TESTING_JWT: string;
}

//TODO: have it this way for testing, but when managed sync is ready,
//will be removing url and just using the Activity model
export interface RequestBody {
	url: string
	id?: string,
	syncId?: string,
	event?: string,
	source?: string,
	receivedAt?: Date,
	data?: string,
	userId?: string,
}

export interface Verification {
	valid: boolean,
	user?: string,
	message?: string,
	status?: number
}

const verifyJwt = (token: string, signingKey: string): Verification => {
	try {
		const verified = jwt.verify(token ?? "", signingKey.replaceAll("\\n", "\n") ?? "");
		return { valid: true, user: verified.sub, message: "success" };
	} catch (err) {
		return { valid: false, message: `token error: ${err as string}` };
	}
}

export const validateRequest = (request: Request, signingKey: string): Verification => {
	if (request.method !== "POST") {
		return { valid: false, status: 405, message: "Please send a POST request with a target URL" }
	}
	let verification: Verification;
	if (request.headers.get("authorization")) {
		const token = request.headers.get("authorization")?.split(" ")[1];
		verification = verifyJwt(token ?? "", signingKey);
		if (!verification.valid) {
			return { valid: false, status: 401, message: "Invalid token" }
		}
		return { valid: true, user: verification.user }
	}
	return { valid: false, status: 401, message: "No token provided" }

}


