// Contains functions for handling server requests related to the app settings. (preferences, resetting the app, etc.)

import type { Context } from "hono";
import { messageTimeDefaults, type BackendResponse } from '../server.ts';
import { resetDb } from "../dbManager.ts";

const resetApp = async function resetApp(c: Context) {
	const resetResponse: BackendResponse = {
		message: "",
		status: "error",
		time: messageTimeDefaults.error
	};

	const resetStatus: BackendResponse = await resetDb();

	if (resetStatus.status === "success") {
		resetResponse.message = resetStatus.message;
		resetResponse.status = "success";
		resetResponse.time = messageTimeDefaults.success;
	} else {
		resetResponse.message = resetStatus.message;
	}

	return c.json(resetResponse);
}

export { resetApp };
