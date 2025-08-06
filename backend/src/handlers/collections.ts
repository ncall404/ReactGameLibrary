import type { Context } from "hono";
import { db } from "../dbManager.ts";

// Get all libraries.
const getLibraries = function getLibraries(c: Context) {
	const query = db.prepare("SELECT * FROM Library");
	const libraries = query.all();
	return c.json(libraries);
}

// Get all wishlists.
const getWishlists = function getWishlists(c: Context) {
	const query = db.prepare("SELECT * FROM Wishlist");
	const wishlists = query.all();
	return c.json(wishlists);
}


export {getLibraries, getWishlists};