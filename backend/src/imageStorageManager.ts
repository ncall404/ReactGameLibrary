// Backend setup file. Sets up the folder path for image storage if it can't be found and clears the storage if requested.

import { access, mkdir, rm } from "fs/promises";
import { constants } from "fs";

import { messageTimeDefaults, type BackendResponse } from './server.ts';

// Clears the contents of the path for image storage. This removes all stored pictures.
const clearImageStorage = async function clearImageStorage(imageStoragePath: string): Promise<void> {
	await rm(imageStoragePath, {recursive: true, force: true});
	await mkdir(imageStoragePath, {recursive: true});
}

// Checks folder path for image storage then creates the path if it wasn't found.
const setupImageStorage = async function setupImageStorage(imageStoragePath: string): Promise<BackendResponse> {
	const response: BackendResponse = {
		message: "Image storage setup incomplete",
		status: "error",
		time: messageTimeDefaults.error
	};
	
	let storageExists: boolean;
	try {
		await access(imageStoragePath, constants.F_OK);
		storageExists = true;
	} catch {
		storageExists = false;
	}

	if (!storageExists) {
		try {
			await mkdir(imageStoragePath, {recursive: true});
			response.message = "Image storage created.";
			response.status = "success";
			response.time = messageTimeDefaults.success;
			return response;
		} catch (err) {
			response.message = "Error creating the directory for image storage; " + err;
			return response;
		}
	}
	response.message = "Image storage already existed.";
	response.status = "informative";
	response.time = messageTimeDefaults.info;
	return response;
}

export {setupImageStorage, clearImageStorage};