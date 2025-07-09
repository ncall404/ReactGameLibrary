// Backend setup file. Sets up the folder path for image storage if it can't be found and clears the storage if requested.

import { access, mkdir } from "fs/promises";
import { constants } from "fs";

// Clears the contents of the path for image storage. This removes all stored pictures.
const clearImageStorage = async function clearImageStorage(imageStoragePath: string) {
	// TODO: Implement function.
}

// Checks folder path for image storage then creates the path if it wasn't found.
const setupImageStorage = async function setupImageStorage(imageStoragePath: string) {
	let storageExists: boolean;
	try {
		await access("../"+imageStoragePath, constants.F_OK);
		storageExists = true;
	} catch {
		storageExists = false;
	}

	if (!storageExists) {
		try {
			await mkdir(imageStoragePath, {recursive: true});
			return "Image storage created.";
		} catch (err) {
			return "Error: Couldn't create directory for image storage; " + err;
		}
	}
	return "Image storage already existed.";
}

export {setupImageStorage, clearImageStorage};