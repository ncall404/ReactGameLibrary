// Contains functions for creating data related to games on the database/backend file system.

import { writeFile, access } from 'fs/promises';
import { fileTypeFromBlob } from 'file-type';
import { join } from 'path';
import type { Context } from "hono";

import { db } from "../dbManager.ts";
import type { BackendResponse } from '../dbManager.ts';

// Type for the object sent back from the server in response to an attempt at uploading a game.
type GameUploadResponse = {
	isValid: boolean; // True if there are no errors, false if there are errors.
	message?: string;
	field?: 
		"gameCollections" | "gameGenres" | "gamePlatforms" | "gameStorefronts" | "gamePublishers" | "gameDevelopers" | "gameMediaFormats" |
		"gameName" | "gameDescription" | "releaseDate" | "coverArt";
	status: "success" | "warning" | "error" | "informative";
}


// Validates the data that will be uploaded to the Game table.
async function validateGameInfo(gameName: string | File, gameDescription: string | File, releaseDate: string | File, coverArt: File | null, gameMediaFormat: number):
Promise<GameUploadResponse> {
	// Validate gameName
	if (typeof gameName !== 'string') { // Type validation
		return {
			isValid: false,
			message: "Error: Name is not valid.",
			field: "gameName",
			status: "error"
		};
	} else if (gameName.trim().length === 0) { // Required field validation
		return {
			isValid: false,
			message: "Error: Name is a required field.",
			field: "gameName",
			status: "error"
		};
	}

	// Validate gameDescription
	if (typeof gameDescription !== 'string') {
		return {
			isValid: false,
			message: "Error: Description is not valid.",
			field: "gameDescription",
			status: "error"
		};
	}

	// Validate releaseDate
	if (typeof releaseDate !== 'string') { // Type validation
		return {
			isValid: false,
			message: "Error: Release Date is not valid.",
			field: "releaseDate",
			status: "error"
		};
	} else if (releaseDate.length > 0 && isNaN(new Date(releaseDate).getTime())) { // Date and format validation
		if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
			return {
				isValid: false,
				message: "Error: Release Date must be in the format YYYY-MM-DD",
				field: "releaseDate",
				status: "error"
			};
		}
		return {
				isValid: false,
				message: "Error: Release Date must be a date.",
				field: "releaseDate",
				status: "error"
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
	if (![1, 2, 3].includes(gameMediaFormat)){
		return {
			isValid: false,
			message: "Error: Media Format must be a valid value.",
			field: "gameMediaFormats",
			status: "error"
		};
	}

	return{ isValid: true, status: "success" };
}


// Validates the image file type as a common browser-compatible image type.
async function validateImageType(coverArtFile: File): Promise<GameUploadResponse> {
	// MIME types of valid image formats.
	const validImageTypes = ["png", "jpeg", "webp", "avif", "svg", "gif", "apng"];

	// Validate against the validImageTypes array.
	const fileType = await fileTypeFromBlob(coverArtFile);
	for (let validType of validImageTypes) {
		if (fileType?.mime === "image/" + validType) {
			return { isValid: true, status: "success" };
		}
	}

	return {
		isValid: false,
		message: "Error: The uploaded image was not a valid file type. Please upload one of the following: " + validImageTypes.toString(),
		field: "coverArt",
		status: "error"
	};
}


// Validates submitted data and then creates entries for the game in the database.
const createGame = async function createGame(c: Context) {
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
					.map(val => parseInt(val.trim())) // Convert to numbers.
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

	let gameMediaFormat: number = 1;
	if (typeof body['gameMediaFormat'] === 'string' && !isNaN(parseInt(body['gameMediaFormat']))) {
		gameMediaFormat = parseInt(body['gameMediaFormat']);
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
				status: "warning"
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
	} else {
		coverArtPath = './images/uploads/no-image-provided'.normalize();
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
			status: "error"
		}
	}

	// Give a success response if there were no complications.
	if (!uploadResponse) {
		uploadResponse = {
			isValid: true,
			message: "Game successfully created!",
			status: "success"
		}
	}

	return c.json(uploadResponse);
}


// Edits a game's data and it's connections to other tables in the databse. Very similar to createGame but with the addition of a gameID and a different query.
const editGame = async function editGame(c: Context) {
	let uploadResponse: GameUploadResponse | null = null;
	const body = await c.req.parseBody();

	const gameID = body['gameID'] as string;

	// Validate that the game belonging to the GameID actually exists
	const validateGameID = db.prepare(`
		SELECT GameID FROM Game
		WHERE GameID = @GameID
	`);
	const gameIDResult = validateGameID.all({GameID: gameID});
	if (gameIDResult.length <= 0) {
		return c.json({
			isValid: false,
			message: "The game you are attempting to edit could not be found.",
			severity: "error",
		});
	}

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
					.map(val => parseInt(val.trim())) // Convert to numbers.
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

	let gameMediaFormat: number = 1;
	if (typeof body['gameMediaFormat'] === 'string' && !isNaN(parseInt(body['gameMediaFormat']))) {
		gameMediaFormat = parseInt(body['gameMediaFormat']);
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
				status: "warning"
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
	} else {
		const getExistingCoverArtPath = db.prepare(`
			SELECT CoverArt
			FROM Game
			WHERE GameID = @GameID;
		`);
		const existingCoverArtPath: string = getExistingCoverArtPath.pluck().get({GameID: gameID}) as string;
		coverArtPath = existingCoverArtPath;
	}

	// Queries for editing the game and it's metadata.
	const editGameWithMetaData = db.transaction(() => {
		// Update the game in the database.
		const updateGame = db.prepare(`
			UPDATE Game
			SET
				Title = @Title,
				Description = @Description,
				ReleaseDate = unixepoch(@ReleaseDate),
				CoverArt = @CoverArt,
				MediaFormatID = @MediaFormatID
			WHERE GameID = @GameID;
		`);
		updateGame.run({GameID: gameID, Title: gameName, Description: gameDescription, ReleaseDate: releaseDate, CoverArt: coverArtPath, MediaFormatID: gameMediaFormat});

		// Check if any company connections were removed and remove them from the database if they were. Due to the differences of the involved table, this is not using the deleteRemovedGameConnections function.
			// Developers
			deleteRemovedGameCompanyConnections("Developer", gameID, arrMultiSelect.gameDevelopers);
			// Publishers
			deleteRemovedGameCompanyConnections("Publisher", gameID, arrMultiSelect.gameDevelopers);
		// Insert any new company connections for the game (developers and publishers) if there are any.
		const insertGameCompany = db.prepare(`
			INSERT OR IGNORE INTO GameCompany (GameID, CompanyID, CompanyRoleID)
			VALUES (@GameID, @CompanyID, @CompanyRoleID);
		`);
		if (arrMultiSelect.gameDevelopers.length > 0 && arrMultiSelect.gameDevelopers[0] !== 0) {
			for (const company of arrMultiSelect.gameDevelopers) insertGameCompany.run({GameID: gameID, CompanyID: company, CompanyRoleID: 1});
		}
		if (arrMultiSelect.gamePublishers.length > 0 && arrMultiSelect.gamePublishers[0] !== 0) {
			for (const company of arrMultiSelect.gamePublishers) insertGameCompany.run({GameID: gameID, CompanyID: company, CompanyRoleID: 2});
		}

		// Check if any genre connections were removed and remove them from the database if they were.
		deleteRemovedGameConnections("GameGenre", "GenreID", gameID, arrMultiSelect.gameGenres);
		// Insert genre connections for the game if there are any.
		if (arrMultiSelect.gameGenres.length > 0 && arrMultiSelect.gameGenres[0] !== 0) {
			const insertGameGenre = db.prepare(`
				INSERT OR IGNORE INTO GameGenre (GameID, GenreID)
				VALUES (@GameID, @GenreID);
			`);
			for (const genre of arrMultiSelect.gameGenres) insertGameGenre.run({GameID: gameID, GenreID: genre});
		}

		// Check if any platform connections were removed and remove them from the database if they were.
		deleteRemovedGameConnections("GamePlatform", "PlatformID", gameID, arrMultiSelect.gamePlatforms);
		// Insert platform connections for the game if there are any.
		if (arrMultiSelect.gamePlatforms.length > 0 && arrMultiSelect.gamePlatforms[0] !== 0) {
			const insertGamePlatform = db.prepare(`
				INSERT OR IGNORE INTO GamePlatform (GameID, PlatformID)
				VALUES (@GameID, @PlatformID);
			`);
			for (const platform of arrMultiSelect.gamePlatforms) insertGamePlatform.run({GameID: gameID, PlatformID: platform});
		}

		// Check if any storefront connections were removed and remove them from the database if they were.
		deleteRemovedGameConnections("GameStorefront", "StorefrontID", gameID, arrMultiSelect.gameStorefronts);
		// Insert storefront connections for the game if there are any.
		if (arrMultiSelect.gameStorefronts.length > 0 && arrMultiSelect.gameStorefronts[0] !== 0) {
			const insertGameStorefront = db.prepare(`
				INSERT OR IGNORE INTO GameStorefront (GameID, StorefrontID)
				VALUES (@GameID, @StorefrontID);
			`);
			for (const storefront of arrMultiSelect.gameStorefronts) insertGameStorefront.run({GameID: gameID, StorefrontID: storefront});
		}

		// Check if any library connections were removed and remove them from the database if they were.
		deleteRemovedGameConnections("GameLibrary", "LibraryID", gameID, arrMultiSelect.gameCollections);
		// Insert library connections for the game.
		const insertIntoGameLibrary = db.prepare(`
			INSERT OR IGNORE INTO GameLibrary (GameID, LibraryID)
			VALUES (@GameID, @LibraryID);
		`);
		for (const library of arrMultiSelect.gameCollections) insertIntoGameLibrary.run({GameID: gameID, LibraryID: library});
	});

	try {
		editGameWithMetaData();
	} catch (err) {
		uploadResponse = {
			isValid: false,
			message: "There was a problem editing the game; " + err,
			status: "error"
		}
	}

	// Give a success response if there were no complications.
	if (!uploadResponse) {
		uploadResponse = {
			isValid: true,
			message: "Game successfully edited!",
			status: "success"
		}
	}

	return c.json(uploadResponse);
}


// Deletes a game and it's connections from the database.
const deleteGame = async function deleteGame(c: Context) {
	const response: BackendResponse = {
		message: "Deleting game not completed.",
		status: "error"
	}

	const body = await c.req.parseBody();
	const deleteGameID = parseInt(body['deleteGameID'] as string);

	if (deleteGameID) {
		const deleteGame = db.transaction(() => {
			// Delete game connections to other tables prior to deleting the game itself.
			const deleteGameLibraryEntry = db.prepare(`
				DELETE FROM GameLibrary
				WHERE GameID = @GameID;
			`);
			const deleteGameGenreEntry = db.prepare(`
				DELETE FROM GameGenre
				WHERE GameID = @GameID;
			`);
			const deleteGamePlatformEntry = db.prepare(`
				DELETE FROM GamePlatform
				WHERE GameID = @GameID;
			`);
			const deleteGameStorefrontEntry = db.prepare(`
				DELETE FROM GameStorefront
				WHERE GameID = @GameID;
			`);
			const deleteGameCompanyEntry = db.prepare(`
				DELETE FROM GameCompany
				WHERE GameID = @GameID;
			`);

			// Delete game from Game table.
			const deleteGameEntry = db.prepare(`
				DELETE FROM Game
				WHERE GameID = @GameID;
			`);

			deleteGameLibraryEntry.run({GameID: deleteGameID});
			deleteGameGenreEntry.run({GameID: deleteGameID});
			deleteGamePlatformEntry.run({GameID: deleteGameID});
			deleteGameStorefrontEntry.run({GameID: deleteGameID});
			deleteGameCompanyEntry.run({GameID: deleteGameID});
			deleteGameEntry.run({GameID: deleteGameID});
		});
		
		try {
			deleteGame();
			response.message = "Game successfully deleted.";
			response.status = "success";
		} catch (err) {
			response.message = `Error deleting the game: ${err}`;
		}
	}

	return c.json(response);
}


// Deletes records from junction tables related to the Game table if they are unselected when a game is edited.
const deleteRemovedGameConnections = function deleteRemovedGameConnections(connectionTableName: string, connectionIdName: string, gameID: string, newConnections: number[]) {
	const getGameConnections = db.prepare(`
		SELECT ${connectionIdName}
		FROM ${connectionTableName}
		WHERE GameID = @GameID
	`);
	const currentConnections = getGameConnections.pluck().all({GameID: gameID});

	const removedConnections: number[] = [];
	for (const connection of currentConnections) {
		const connectionInt = parseInt(connection as string);
		if (!newConnections.includes(connectionInt)) {
			removedConnections.push(connectionInt);
		}
	}

	const deleteGameConnection = db.prepare(`
		DELETE FROM ${connectionTableName}
		WHERE GameID = @GameID AND ${connectionIdName} = @ConnectionID;
	`);
	for (const connectionID of removedConnections) {
		deleteGameConnection.run({GameID: gameID, ConnectionID: connectionID});
	}
}


// // Deletes records from the GameCompany table if they are unselected when a game is edited. Specialized alternative of the deleteRemovedGameConnections function.
const deleteRemovedGameCompanyConnections = function deleteRemovedGameCompanyConnections(companyRole: "Developer" | "Publisher", gameID: string, newConnections: number[]) {
	const getGameConnections = db.prepare(`
		SELECT CompanyID
		FROM GameCompany gc
		JOIN CompanyRole cr ON gc.CompanyRoleID = cr.CompanyRoleID
		WHERE GameID = @GameID AND cr.Title = @CompanyRole;
	`);
	const currentConnections = getGameConnections.pluck().all({GameID: gameID, CompanyRole: companyRole});

	const removedConnections: number[] = [];
	for (const connection of currentConnections) {
		const connectionInt = parseInt(connection as string);
		if (!newConnections.includes(connectionInt)) {
			removedConnections.push(connectionInt);
		}
	}

	const deleteGameConnection = db.prepare(`
		DELETE FROM GameCompany
		WHERE GameID = @GameID
		AND CompanyID = CompanyID
		AND CompanyRoleID = (SELECT CompanyRoleID FROM CompanyRole WHERE Title = @CompanyRole);
	`);
	for (const companyID of removedConnections) {
		deleteGameConnection.run({GameID: gameID, CompanyID: companyID, CompanyRole: companyRole});
	}
}


// Retreives a single requested game.
const getGameData = function getGameData(c: Context) {
	const response: BackendResponse = {
		message: "Getting game data not completed.",
		status: "error"
	}

	const gameID = c.req.param('gameID');

	if (parseInt(gameID) == 0) {
		response.message = "No game requested";
		response.status = "informative";
		return c.json(response);
	}

	// Queries for getting the game and all of it's metadata.
	const gameData = db.prepare(`
		SELECT g.Title as Title, g.Description, g.ReleaseDate, g.CoverArt, g.MediaFormatID, m.Title as MediaFormatTitle
		FROM Game g
		JOIN MediaFormat m ON g.MediaFormatID = m.MediaFormatID
		WHERE g.GameID = @GameID;
	`);
	const libraryData = db.prepare(`
		SELECT l.LibraryID, l.Title
		FROM Library l
		JOIN GameLibrary gl ON l.LibraryID = gl.LibraryID
		WHERE gl.GameID = @GameID;
	`);
	const publisherData = db.prepare(`
		SELECT DISTINCT c.CompanyID, c.Title
		FROM GameCompany gc
		JOIN Company c ON gc.CompanyID = c.CompanyID
		JOIN Companyrole cr ON gc.CompanyRoleID = cr.CompanyRoleID
		WHERE gc.GameID = @GameID AND cr.Title = 'Publisher';
	`);
	const developerData = db.prepare(`
		SELECT DISTINCT c.CompanyID, c.Title
		FROM GameCompany gc
		JOIN Company c ON gc.CompanyID = c.CompanyID
		JOIN Companyrole cr ON gc.CompanyRoleID = cr.CompanyRoleID
		WHERE gc.GameID = @GameID AND cr.Title = 'Developer';
	`);
	const genreData = db.prepare(`
		SELECT gen.GenreID, gen.Title
		FROM Genre gen
		JOIN GameGenre gg ON gen.GenreID = gg.GenreID
		WHERE gg.GameID = @GameID;
	`);
	const platformData = db.prepare(`
		SELECT p.PlatformID, p.Title
		FROM Platform p
		JOIN GamePlatform gp ON p.PlatformID = gp.PlatformID
		WHERE gp.GameID = @GameID;
	`);
	const storefrontData = db.prepare(`
		SELECT s.StorefrontID, s.Title
		FROM Storefront s
		JOIN GameStorefront gs ON s.StorefrontID = gs.StorefrontID
		WHERE gs.GameID = @GameID;
	`);

	try {
		const game = gameData.get({GameID: gameID});
		const libraries = libraryData.all({GameID: gameID});
		const publishers = publisherData.all({GameID: gameID});
		const developers = developerData.all({GameID: gameID});
		const genres = genreData.all({GameID: gameID});
		const platforms = platformData.all({GameID: gameID});
		const storefronts = storefrontData.all({GameID: gameID});

		return c.json({
			gameData: game,
			libraryData: libraries,
			publisherData: publishers,
			developerData: developers,
			genreData: genres,
			platformData: platforms,
			storefrontData: storefronts,
		});
	} catch (err) {
		response.message = `There was an issue retrieving data; ${err}`;
		return c.json(response);
	}
}


export {createGame, editGame, deleteGame, getGameData};