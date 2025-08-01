// Contains functions for retrieving data related to game libraries.

import type { Context } from "hono";
import { db } from "../dbManager.ts";

const getGamesLibrary = function getGamesLibrary(c: Context) {
	const libraryId = c.req.param('libraryId');
	const query = db.prepare(`
		SELECT g.GameID, g.Title AS Title, g.Description, g.ReleaseDate, g.CoverArt,
		(
			SELECT group_concat(Title, ', ')
			FROM (
				SELECT DISTINCT c.Title
				FROM GameCompany gc
				JOIN Company c ON gc.CompanyID = c.CompanyID
				JOIN Companyrole cr ON gc.CompanyRoleID = cr.CompanyRoleID
				WHERE gc.GameID = g.GameID AND cr.Title = 'Publisher'
			)
		) AS Publishers,
		(
			SELECT group_concat(Title, ', ')
			FROM (
				SELECT DISTINCT c.Title
				FROM GameCompany gc
				JOIN Company c ON gc.CompanyID = c.CompanyID
				JOIN Companyrole cr ON gc.CompanyRoleID = cr.CompanyRoleID
				WHERE gc.GameID = g.GameID AND cr.Title = 'Developer'
			)
		) AS Developers,
		group_concat(gen.Title, ', ') AS Genres
		FROM Game g 
		JOIN GameLibrary gl ON g.GameID = gl.GameID
		LEFT JOIN GameGenre gg ON g.GameID = gg.GameID
		LEFT JOIN Genre gen ON gg.GenreID = gen.GenreID
		WHERE gl.LibraryID = ?
		GROUP BY g.GameID;
	`);
	const games = query.all(libraryId);
	return c.json(games);
}

export {getGamesLibrary};