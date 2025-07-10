// Contains functions for retrieving data related to game libraries.

import type { Context } from "hono";
import { db } from "../dbManager.ts";

const getGamesLibrary = function getGamesLibrary(c: Context) {
	// TODO: Change the query to return the name of the publisher and developer companies instead of the ids?
	const libraryId = c.req.param('libraryId');
	const query = db.prepare('SELECT * FROM Game g JOIN GameLibrary gl ON g.GameID = gl.GameID WHERE gl.LibraryID = ?');
	const games = query.all(libraryId);
	return c.json(games);
}

export {getGamesLibrary};