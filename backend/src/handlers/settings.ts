// Contains functions for handling server requests related to the app settings. (preferences, resetting the app, etc.)

import type { Context } from "hono";
import type { BackendResponse } from "../dbManager.ts";
import { resetDb } from "../dbManager.ts";

type SettingsResponse = {
	message?: string;
	severity?: "success" | "error";
}

const resetApp = async function resetApp(c: Context) {
	let uploadResponse: SettingsResponse | null = null;

	const resetStatus: BackendResponse = await resetDb();

	if (resetStatus.status === "success") {
		uploadResponse = {
			message: resetStatus.message,
			severity: "success"
		}
	} else {
		uploadResponse = {
			message: resetStatus.message,
			severity: "error"
		}
	}

	return c.json(uploadResponse);
}

export { resetApp };
