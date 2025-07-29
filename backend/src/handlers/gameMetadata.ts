// Contains functions for retrieving data related to game metadata stored in the database such as genres, platforms, etc.

import type { Context } from "hono";
import { db } from "../dbManager.ts";

// TODO: Look into making a combined API function or database query for getAll functions for when genres, platforms, storefronts, and companies are all needed (such as in the new game form).

// Genres -------------------------------------------------------------------
const getGenres = function getGenres(c: Context) {
	const query = db.prepare("SELECT * FROM Genre");
	const genres = query.all();
	return c.json(genres);
}

// Platforms ----------------------------------------------------------------
const getPlatforms = function getPlatforms(c: Context) {
	const query = db.prepare(`
		SELECT p.PlatformID, p.Title as PlatformTitle, c.Title as CompanyTitle
		FROM Platform p
		JOIN Company c ON p.CompanyID = c.CompanyID;
		`);
	const platforms = query.all();
	return c.json(platforms)
}

export {getGenres, getPlatforms}