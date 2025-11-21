// Contains functions for creating data related to games on the database/backend file system.

import { writeFile, access } from 'fs/promises';
import { fileTypeFromBlob } from 'file-type';
import { join } from 'path';
import type { Context } from "hono";
import { db } from "../dbManager.ts";

// Type for the object sent back from the server in response to an attempt at uploading a game.
type GameUploadResponse = {
	isValid: boolean; // True if there are no errors, false if there are errors.
	message?: string;
	field?: 
		"gameCollections" | "gameGenres" | "gamePlatforms" | "gameStorefronts" | "gamePublishers" | "gameDevelopers" | "gameMediaFormats" |
		"gameName" | "gameDescription" | "releaseDate" | "coverArt";
	severity?: "success" | "warning" | "error" | "informative";
}


// Validates submitted data and then creates entries for the game in the database.
const addGameToLibrary = async function addGameToLibrary(c: Context) {
	let uploadResponse: GameUploadResponse | null = null;
	const body = await c.req.parseBody();

	const multiSelect = { // Get all of the data from Select components that can have more than one selection.
		gameCollections: body['gameCollections'],
		gameGenres: body['gameGenres'],
		gamePlatforms: body['gamePlatforms'],
		gameStorefronts: body['gameStorefronts'],
		gamePublishers: body['gamePublishers'],
		gameDevelopers: body['gameDevelopers'],
	};
	const arrMultiSelect = Object.fromEntries( // Make arrays of selected values from the selections.
		Object.entries(multiSelect).map(([key, value]) => {
			if (typeof value === 'string') { // Verify the value isn't a file.
				return [key, value.split(',') // Split the selections into an array.
					.map(val => Number(val.trim())) // Convert to numbers.
					.filter(num => !isNaN(num)) // Make sure only valid numbers get through.
				];
			}
			return [key, []]; // Fallback.
		})
	);

	// Get game info from request body.
	const gameName = body['gameName'];
	const gameDescription = body['gameDescription'];
	const releaseDate = body['releaseDate'];
	const coverArt = typeof body['coverArt'] === 'string' ? null : body['coverArt'] as File;

	let gameMediaFormat: number | null = null;
	if (typeof body['gameMediaFormat'] === 'string' && !isNaN(Number(body['gameMediaFormat']))) {
		gameMediaFormat = Number(body['gameMediaFormat']);
	}
	
	const validateGameInfoResponse = await validateGameInfo(gameName, gameDescription, releaseDate, coverArt, gameMediaFormat);
	if (!validateGameInfoResponse.isValid) {
		return c.json(validateGameInfoResponse);
	}

	let coverArtPath = "";
	if (coverArt) {
		coverArtPath = join('./images/uploads/', coverArt.name);
		try {
			await access(coverArtPath);
			uploadResponse = {
				isValid: true,
				message: "Game uploaded. Warning: Using existing cover art image. To use a different image, please give it a different name.",
				field: "coverArt",
				severity: "warning"
			};
		} catch(err) {
			try {
				await writeFile(coverArtPath, Buffer.from(await coverArt.arrayBuffer()));
			} catch (err) {
				return c.json({
					isValid: false,
					message: "Error: There was a problem writing the cover art image to the server; " + err,
					field: "coverArt",
					severity: "error"
				});
			}
		}
	}

	// Queries for uploading the new game and it's metadata.
	const insertGameWithMetaData = db.transaction(() => {
		// Insert the game into the database.
		const insertGame = db.prepare(`
			INSERT INTO Game (Title, Description, ReleaseDate, CoverArt, MediaFormatID)
			VALUES (@Title, @Description, unixepoch(@ReleaseDate), @CoverArt, @MediaFormatID);
		`);
		insertGame.run({Title: gameName, Description: gameDescription, ReleaseDate: releaseDate, CoverArt: coverArtPath, MediaFormatID: gameMediaFormat});
		
		// Get the ID of the new game.
		const getGameID = db.prepare(`
			SELECT GameID FROM Game
			ORDER BY GameID
			DESC LIMIT 1;
		`);
		const newGameIDResult = getGameID.get() as {GameID: number};
		const newGameID = newGameIDResult.GameID;

		// Insert company connections for the game (developers and publishers) if there are any.
		const insertGameCompany = db.prepare(`
			INSERT INTO GameCompany (GameID, CompanyID, CompanyRoleID)
			VALUES (@GameID, @CompanyID, @CompanyRoleID);
		`);
		if (arrMultiSelect.gameDevelopers.length > 0 && arrMultiSelect.gameDevelopers[0] !== 0) {
			for (const company of arrMultiSelect.gameDevelopers) insertGameCompany.run({GameID: newGameID, CompanyID: company, CompanyRoleID: 1});
		}
		if (arrMultiSelect.gamePublishers.length > 0 && arrMultiSelect.gamePublishers[0] !== 0) {
			for (const company of arrMultiSelect.gamePublishers) insertGameCompany.run({GameID: newGameID, CompanyID: company, CompanyRoleID: 2});
		}

		// Insert platform connections for the game if there are any.
		if (arrMultiSelect.gamePlatforms.length > 0 && arrMultiSelect.gamePlatforms[0] !== 0) {
			const insertGamePlatform = db.prepare(`
				INSERT INTO GamePlatform (GameID, PlatformID)
				VALUES (@GameID, @PlatformID);
			`);
			for (const platform of arrMultiSelect.gamePlatforms) insertGamePlatform.run({GameID: newGameID, PlatformID: platform});
		}

		// Insert genre connections for the game if there are any.
		if (arrMultiSelect.gameGenres.length > 0 && arrMultiSelect.gameGenres[0] !== 0) {
			const insertGameGenre = db.prepare(`
				INSERT INTO GameGenre (GameID, GenreID)
				VALUES (@GameID, @GenreID);
			`);
			for (const genre of arrMultiSelect.gameGenres) insertGameGenre.run({GameID: newGameID, GenreID: genre});
		}

		// Insert storefront connections for the game if there are any.
		if (arrMultiSelect.gameStorefronts.length > 0 && arrMultiSelect.gameStorefronts[0] !== 0) {
			const insertGameStorefront = db.prepare(`
				INSERT INTO GameStorefront (GameID, StorefrontID)
				VALUES (@GameID, @StorefrontID);
			`);
			for (const storefront of arrMultiSelect.gameStorefronts) insertGameStorefront.run({GameID: newGameID, StorefrontID: storefront});
		}

		// Insert library connections for the game.
		const insertIntoGameLibrary = db.prepare(`
			INSERT INTO GameLibrary (GameID, LibraryID)
			VALUES (@GameID, @LibraryID);
		`);
		for (const library of arrMultiSelect.gameCollections) insertIntoGameLibrary.run({GameID: newGameID, LibraryID: library});
	});

	try {
		insertGameWithMetaData();
	} catch (err) {
		uploadResponse = {
			isValid: false,
			message: "Error: There was a problem adding the game to the database; " + err,
			severity: "error"
		}
	}

	// Give a success response if there were no complications.
	if (!uploadResponse) {
		uploadResponse = {
			isValid: true,
			message: "Game successfully created!"
		}
	}

	return c.json(uploadResponse);
}


// Validates the data that will be uploaded to the Game table.
async function validateGameInfo(gameName: string | File, gameDescription: string | File, releaseDate: string | File, coverArt: File | null, gameMediaFormat: number | null):
Promise<GameUploadResponse> {
	// Validate gameName
	if (typeof gameName !== 'string') { // Type validation
		return {
			isValid: false,
			message: "Error: Name is not valid.",
			field: "gameName",
			severity: "error"
		};
	} else if (gameName.trim().length === 0) { // Required field validation
		return {
			isValid: false,
			message: "Error: Name is a required field.",
			field: "gameName",
			severity: "error"
		};
	}

	// Validate gameDescription
	if (typeof gameDescription !== 'string') {
		return {
			isValid: false,
			message: "Error: Description is not valid.",
			field: "gameDescription",
			severity: "error"
		};
	}

	// Validate releaseDate
	if (typeof releaseDate !== 'string') { // Type validation
		return {
			isValid: false,
			message: "Error: Release Date is not valid.",
			field: "releaseDate",
			severity: "error"
		};
	} else if (releaseDate.length === 0) {
		return {
			isValid: false,
			message: "Error: Release Date is a required field.",
			field: "releaseDate",
			severity: "error"
		}; // TODO: Evaluate if releaseDate should be a required field.
	} else if (isNaN(new Date(releaseDate).getTime())) { // Date and format validation
		if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
			return {
				isValid: false,
				message: "Error: Release Date must be in the format YYYY-MM-DD",
				field: "releaseDate",
				severity: "error"
			};
		}
		return {
				isValid: false,
				message: "Error: Release Date must be a date.",
				field: "releaseDate",
				severity: "error"
			};
	}

	// Validate coverArt
	if (coverArt) {
		const covertArtValidation = await validateImageType(coverArt);
		if (!covertArtValidation.isValid) {
			return covertArtValidation;
		}
	}

	// Validate gameMediaFormat
	if (gameMediaFormat !== null && ![1, 2, 3].includes(gameMediaFormat)){
		return {
			isValid: false,
			message: "Error: Media Format must be empty or a valid value.",
			field: "gameMediaFormats",
			severity: "error"
		};
	}

	return{ isValid: true };
}


// Validates the image file type as a common browser-compatible image type.
async function validateImageType(coverArtFile: File): Promise<GameUploadResponse> {
	// MIME types of valid image formats.
	const validImageTypes = ["png", "jpeg", "webp", "avif", "svg", "gif", "apng"];

	// Validate against the validImageTypes array.
	const fileType = await fileTypeFromBlob(coverArtFile);
	for (let validType of validImageTypes) {
		if (fileType?.mime === "image/" + validType) {
			return { isValid: true };
		}
	}

	return {
		isValid: false,
		message: "Error: The uploaded image was not a valid file type. Please upload one of the following: " + validImageTypes.toString(),
		field: "coverArt",
		severity: "error"
	};
}

export {addGameToLibrary};