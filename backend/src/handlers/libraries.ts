// Contains functions for retrieving data related to game libraries.

import type { Context } from "hono";
import { db } from "../dbManager.ts";

import type { BackendResponse } from '../server.ts';

type GameObject = {
	gameData: {
		GameID: number,
		Title: string,
		Description: string,
		ReleaseDate: number,
		CoverArt: string,
		MediaFormatTitle: string
	},
	publisherData: {
		Title: string
	}[],
	developerData: {
		Title: string
	}[],
	platformData: {
		Title: string
	}[],
	storefrontData: {
		Title: string
	}[],
	genreData: {
		Title: string
	}[]
}

// Retrieves all games in the database that don't belong to a game library. Will have to expand to check if they are in a wishlist if/when that gets implemented.
const getGamesWithoutCollection = function getGamesWithoutCollection(c: Context) {
	const response: BackendResponse = {
		message: "There was trouble when loading the game library.",
		status: "error"
	}

	const getGameIDsFromLibrary = db.prepare(`
			SELECT g.GameID
			FROM Game g
			LEFT JOIN GameLibrary gl ON g.GameID = gl.GameID
			WHERE gl.GameID IS NULL;
		`);
		const gameIDsFromLibrary = getGameIDsFromLibrary.pluck().all();

		const games: GameObject[] = [];
		
		for (const gameID of gameIDsFromLibrary) {
			const gameData = db.prepare(`
				SELECT g.GameID as GameID, g.Title as Title, g.Description, g.ReleaseDate, g.CoverArt, g.MediaFormatID, m.Title as MediaFormatTitle
				FROM Game g
				JOIN MediaFormat m ON g.MediaFormatID = m.MediaFormatID
				WHERE g.GameID = @GameID;
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
			const genreData = db.prepare(`
				SELECT gen.GenreID, gen.Title
				FROM Genre gen
				JOIN GameGenre gg ON gen.GenreID = gg.GenreID
				WHERE gg.GameID = @GameID;
			`);

			try {
				const game = gameData.get({GameID: gameID});
				const publishers = publisherData.all({GameID: gameID});
				const developers = developerData.all({GameID: gameID});
				const platforms = platformData.all({GameID: gameID});
				const storefronts = storefrontData.all({GameID: gameID});
				const genres = genreData.all({GameID: gameID});

				games.push({
					gameData: game as {
						GameID: number,
						Title: string,
						Description: string,
						ReleaseDate: number,
						CoverArt: string,
						MediaFormatTitle: string
					},
					publisherData: publishers as {
						Title: string
					}[],
					developerData: developers as {
						Title: string
					}[],
					platformData: platforms as {
						Title: string
					}[],
					storefrontData: storefronts as {
						Title: string
					}[],
					genreData: genres as {
						Title: string
					}[]
				});
			} catch (err) {
				response.message = `There was an issue loading the game library: ${err}`;
				return c.json(response);
			}
		}

		return c.json({
			games: games
		});
}


// Retrieves all of the games in in the database that belong to a specific game library.
const getGamesLibrary = function getGamesLibrary(c: Context) {
	const libraryId = c.req.param('libraryId');

	const response: BackendResponse = {
		message: "There was trouble when loading the game library.",
		status: "error"
	}

	if (parseInt(libraryId) > 0) {
		const getGameIDsFromLibrary = db.prepare(`
			SELECT GameID
			FROM GameLibrary
			WHERE LibraryID = @LibraryID;
		`);
		const gameIDsFromLibrary = getGameIDsFromLibrary.pluck().all({LibraryID: libraryId});

		const games: GameObject[] = [];
		
		for (const gameID of gameIDsFromLibrary) {
			const gameData = db.prepare(`
				SELECT g.GameID as GameID, g.Title as Title, g.Description, g.ReleaseDate, g.CoverArt, g.MediaFormatID, m.Title as MediaFormatTitle
				FROM Game g
				JOIN MediaFormat m ON g.MediaFormatID = m.MediaFormatID
				WHERE g.GameID = @GameID;
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
			const genreData = db.prepare(`
				SELECT gen.GenreID, gen.Title
				FROM Genre gen
				JOIN GameGenre gg ON gen.GenreID = gg.GenreID
				WHERE gg.GameID = @GameID;
			`);

			try {
				const game = gameData.get({GameID: gameID});
				const publishers = publisherData.all({GameID: gameID});
				const developers = developerData.all({GameID: gameID});
				const platforms = platformData.all({GameID: gameID});
				const storefronts = storefrontData.all({GameID: gameID});
				const genres = genreData.all({GameID: gameID});

				games.push({
					gameData: game as {
						GameID: number,
						Title: string,
						Description: string,
						ReleaseDate: number,
						CoverArt: string,
						MediaFormatTitle: string
					},
					publisherData: publishers as {
						Title: string
					}[],
					developerData: developers as {
						Title: string
					}[],
					platformData: platforms as {
						Title: string
					}[],
					storefrontData: storefronts as {
						Title: string
					}[],
					genreData: genres as {
						Title: string
					}[]
				});
			} catch (err) {
				response.message = `There was an issue loading the game library: ${err}`;
				return c.json(response);
			}
		}
		
		return c.json({
			games: games
		});
	} else {
		return getGamesWithoutCollection(c);
	}
}

export {getGamesLibrary};