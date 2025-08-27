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

// TODO: Implement
const addGenre = function addGenre(c: Context) {
	const query = db.prepare("");
	
	return c.json("Placeholder");
}
// TODO: Implement
const removeGenres = function removeGenres(c: Context) {
	const query = db.prepare("");
	
	return c.json("Placeholder");
}

// Platforms ----------------------------------------------------------------
const getPlatforms = function getPlatforms(c: Context) {
	const query = db.prepare(`
		SELECT p.PlatformID, p.Title as PlatformTitle, coalesce(c.Title, 'None') as CompanyTitle
		FROM Platform p
		LEFT JOIN Company c ON p.CompanyID = c.CompanyID;
		`);
	const platforms = query.all();
	return c.json(platforms)
}

// TODO: Implement
const addPlatform = function addPlatform(c: Context) {
	const query = db.prepare("");
	
	return c.json("Placeholder");
}
// TODO: Implement
const removePlatforms = function removePlatforms(c: Context) {
	const query = db.prepare("");
	
	return c.json("Placeholder");
}

// Companies ----------------------------------------------------------------
	// Get all companies and their roles.
const getCompanies = function getCompanies(c: Context) {
	const query = db.prepare(`
		SELECT c.CompanyID as CompanyID, c.Title as Title, group_concat(ct.Title, ',') as CompanyTypes
		FROM Company c
		JOIN CompanyCompanyType cct ON c.CompanyID = cct.CompanyID
		JOIN CompanyType ct ON cct.CompanyTypeID = ct.CompanyTypeID
		GROUP BY cct.CompanyID;
		`);
	const companies = query.all();
	return c.json(companies);
}
	// Get all platform owner companies.
const getPlatformOwners = function getPlatformOwners(c: Context) {
	const query = db.prepare(`
		SELECT c.CompanyID as CompanyID, c.Title as Title
		FROM Company c
		JOIN CompanyCompanyType cct ON c.CompanyID = cct.CompanyID
		WHERE cct.CompanyTypeID = 1
		`);
	const platformOwners = query.all();
	return c.json(platformOwners);
}
	// Get all developer companies.
const getDevelopers = function getDevelopers(c: Context) {
	const query = db.prepare(`
		SELECT c.CompanyID as CompanyID, c.Title as Title
		FROM Company c
		JOIN CompanyCompanyType cct ON c.CompanyID = cct.CompanyID
		WHERE cct.CompanyTypeID = 2;
		`);
	const developers = query.all();
	return c.json(developers);
}
	// Get all publisher companies.
const getPublishers = function getPublishers(c: Context) {
	const query = db.prepare(`
		SELECT c.CompanyID as CompanyID, c.Title as Title
		FROM Company c
		JOIN CompanyCompanyType cct ON c.CompanyID = cct.CompanyID
		WHERE cct.CompanyTypeID = 3;
		`);
	const publishers = query.all();
	return c.json(publishers);
}
	// Get all company types.
const getCompanyTypes = function getCompanyTypes(c: Context) {
	const query = db.prepare(`
		SELECT * FROM CompanyType
		`);
	const companyTypes = query.all();
	return c.json(companyTypes);
}

// TODO: Implement
const addCompany = function addCompany(c: Context) {
	const query = db.prepare("");
	
	return c.json("Placeholder");
}
// TODO: Implement
const removeCompanies = function removeCompanies(c: Context) {
	const query = db.prepare("");
	
	return c.json("Placeholder");
}

// Storefronts --------------------------------------------------------------
	// With websites
const getStorefronts = function getStorefronts(c: Context) {
	const query = db.prepare(`
		SELECT * FROM Storefront;
		`);
	const storefronts = query.all();
	return c.json(storefronts);
}
	// Without websites
const getStorefrontBasics = function getStorefronts(c: Context) {
	const query = db.prepare(`
		SELECT StorefrontID, Title FROM Storefront;
		`);
	const storefronts = query.all();
	return c.json(storefronts);
}

// TODO: Implement
const addStorefront = function addStorefront(c: Context) {
	const query = db.prepare("");
	
	return c.json("Placeholder");
}
// TODO: Implement
const removeStorefronts = function removeStorefronts(c: Context) {
	const query = db.prepare("");
	
	return c.json("Placeholder");
}

export {getGenres, addGenre, removeGenres,
		getPlatforms, addPlatform, removePlatforms,
		getCompanies, getPlatformOwners, getDevelopers, getPublishers, getCompanyTypes, addCompany, removeCompanies,
		getStorefronts, addStorefront, removeStorefronts};