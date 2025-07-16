// Contains functions for retrieving data related to game libraries.

import type { Context } from "hono";
import { db } from "../dbManager.ts";

const getGamesLibrary = function getGamesLibrary(c: Context) {
	const libraryId = c.req.param('libraryId');
	const query = db.prepare(`
		SELECT g.GameID, g.Title as Title, Description, ReleaseDate, CoverArt, pub.Title as PublisherName, dev.Title as DeveloperName, group_concat(gen.Title, ', ') as Genres
		FROM Game g 
		JOIN GameLibrary gl ON g.GameID = gl.GameID
		JOIN Company pub ON g.PublisherID = pub.CompanyID
		JOIN Company dev ON g.DeveloperID = dev.CompanyID
		LEFT JOIN GameGenre gg ON g.GameID = gg.GameID
		LEFT JOIN Genre gen ON gg.GenreID = gen.GenreID
		WHERE gl.LibraryID = ?
		GROUP BY g.GameID;
`);
	const games = query.all(libraryId);
	return c.json(games);
}

export {getGamesLibrary};