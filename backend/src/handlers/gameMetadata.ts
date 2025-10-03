// Contains functions for retrieving data related to game metadata stored in the database such as genres, platforms, etc.

import type { Context } from "hono";
import { db } from "../dbManager.ts";

// TODO: Consider making a combined API function or database query for getAll functions for when genres, platforms, storefronts, and companies are all needed (such as in the new game form).

// Type for the object sent back from the server in response to an attempt at adding/removing/editing a metadata record.
type MetadataActionResponse = {
	action: "add" | "remove" | "edit";
	isValid: boolean; // True if there are no errors, false if there are errors.
	message?: string;
	severity?: "success" | "warning" | "error" | "informative";
}


// Genres -------------------------------------------------------------------
	// Retrieves all genre entries from the Genre table.
const getGenres = function getGenres(c: Context) {
	const query = db.prepare("SELECT * FROM Genre");
	const genres = query.all();
	return c.json(genres);
}

	// Adds a new genre to the Genre table.
const addGenre = async function addGenre(c: Context) {
	let actionResponse: MetadataActionResponse = {action: "add", isValid: false};
	const body = await c.req.parseBody();
	const genreTitle = body['metadataAddTitle'];

	if (typeof genreTitle === 'string' && genreTitle.length > 0) {
		try {
			const query = db.prepare(`
				INSERT INTO Genre (Title)
				VALUES (@Title);
			`);
			query.run({Title: genreTitle});
			actionResponse = {
				action: "add",
				isValid: true,
				message: "Genre successfully added to the database!",
				severity: "success"
			};
		} catch (err) {
			actionResponse = {
				action: "add",
				isValid: false,
				message: "Error: The genre could not be added to the database; " + err,
				severity: "error"
			};
		}
	} else {
		actionResponse = {
			action: "add",
			isValid: false,
			message: "Error: The genre name must not be empty",
			severity: "error"
		};
	}
	
	return c.json(actionResponse);
}
	// Removes selected genre(s) from the Genre table and other connected tables (GameGenre).
const removeGenres = async function removeGenres(c: Context) {
	let actionResponse: MetadataActionResponse = {action: "remove", isValid: false};
	const body = await c.req.parseBody();
	const selectedGenresString = body['editMetadataRemove'];
	if (typeof selectedGenresString !== 'string') {
		actionResponse = {
			action: "remove",
			isValid: false,
			message: "Error: Invalid genre selection input.",
			severity: "error"
		};
	} else if (selectedGenresString.length == 0) {
		actionResponse = {
			action: "remove",
			isValid: false,
			message: "No genres were selected for removal.",
			severity: "warning"
		}
	} else {
		const selectedGenres = selectedGenresString.split(',');
		
		const deleteSelectedGenres = db.transaction(() => {
			const deleteGameConnections = db.prepare(`
				DELETE FROM GameGenre
				WHERE GenreID = @GenreID;
			`);
			const deleteGenre = db.prepare(`
				DELETE FROM Genre
				WHERE GenreID = @GenreID;
			`);
			for (const genre of selectedGenres) {
				const genreID = parseInt(genre);
				deleteGameConnections.run({GenreID: genreID});
				deleteGenre.run({GenreID: genreID});
			}
		});

		try {
			deleteSelectedGenres();
			actionResponse = {
				action: "remove",
				isValid: true,
				message: "Genre(s) successfully removed from the database!",
				severity: "success"
			};
		} catch (err) {
			actionResponse = {
				action: "remove",
				isValid: false,
				message: "Error: The selected genre(s) could not be remove from the database; " + err,
				severity: "error"
			};
		}
	}
	
	return c.json(actionResponse);
}


// Platforms ----------------------------------------------------------------
	// Retrieves all platform entries from the Platform table and the connected data from the Company table.
const getPlatforms = function getPlatforms(c: Context) {
	const query = db.prepare(`
		SELECT p.PlatformID, p.Title as PlatformTitle, coalesce(c.Title, 'None') as CompanyTitle
		FROM Platform p
		LEFT JOIN Company c ON p.CompanyID = c.CompanyID;
		`);
	const platforms = query.all();
	return c.json(platforms)
}

	// Adds a new platform to the Platform table.
const addPlatform = async function addPlatform(c: Context) {
	let actionResponse: MetadataActionResponse = {action: "add", isValid: false};
	const body = await c.req.parseBody();
	const platformTitle = body['metadataAddTitle'];
	const platformOwnerID = body['platformOwner'];

	if (typeof platformTitle === 'string' && platformTitle.length > 0) {
		// Do this when there is a platform owner specified.
		if (typeof platformOwnerID === 'string' && platformOwnerID.length > 0) {
			try {
				const query = db.prepare(`
					INSERT INTO Platform (Title, CompanyID)
					VALUES (@Title, @CompanyID);
				`);
				query.run({Title: platformTitle, CompanyID: parseInt(platformOwnerID)});
				actionResponse = {
					action: "add",
					isValid: true,
					message: "Platform successfully added to the database!",
					severity: "success"
				};
			} catch (err) {
				actionResponse = {
					action: "add",
					isValid: false,
					message: "Error: The platform could not be added to the database; " + err,
					severity: "error"
				};
			}
		}
		// Do this when there is no platform owner specified.
		else {
			try {
				const query = db.prepare(`
					INSERT INTO Platform (Title)
					VALUES (@Title);
				`);
				query.run({Title: platformTitle});
				actionResponse = {
					action: "add",
					isValid: true,
					message: "Platform successfully added to the database!",
					severity: "success"
				};
			} catch (err) {
				actionResponse = {
					action: "add",
					isValid: false,
					message: "Error: The platform could not be added to the database; " + err,
					severity: "error"
				};
			}
		}
	} else {
		actionResponse = {
			action: "add",
			isValid: false,
			message: "Error: The platform name must not be empty",
			severity: "error"
		};
	}
	
	return c.json(actionResponse);
}
	// Removes selected platform(s) from the Platform table and other connected tables (GamePlatform).
const removePlatforms = async function removePlatforms(c: Context) {
	let actionResponse: MetadataActionResponse = {action: "remove", isValid: false};
	const body = await c.req.parseBody();
	const selectedPlatformsString = body['editMetadataRemove'];
	if (typeof selectedPlatformsString !== 'string') {
		actionResponse = {
			action: "remove",
			isValid: false,
			message: "Error: Invalid platform selection input.",
			severity: "error"
		};
	} else if (selectedPlatformsString.length == 0) {
		actionResponse = {
			action: "remove",
			isValid: false,
			message: "No platforms were selected for removal.",
			severity: "warning"
		}
	} else {
		const selectedPlatforms = selectedPlatformsString.split(',');
		
		const deleteSelectedPlatforms = db.transaction(() => {
			const deleteGameConnections = db.prepare(`
				DELETE FROM GamePlatform
				WHERE PlatformID = @PlatformID;
			`);
			const deletePlatform = db.prepare(`
				DELETE FROM Platform
				WHERE PlatformID = @PlatformID;
			`);
			for (const platform of selectedPlatforms) {
				const platformID = parseInt(platform);
				deleteGameConnections.run({PlatformID: platformID});
				deletePlatform.run({PlatformID: platformID});
			}
		});

		try {
			deleteSelectedPlatforms();
			actionResponse = {
				action: "remove",
				isValid: true,
				message: "Platform(s) successfully removed from the database!",
				severity: "success"
			};
		} catch (err) {
			actionResponse = {
				action: "remove",
				isValid: false,
				message: "Error: The selected platform(s) could not be remove from the database; " + err,
				severity: "error"
			};
		}
	}
	
	return c.json(actionResponse);
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

	// Adds a new company to the Company table. Adds connections between the Company and Company Types tables with the CompanyCompanyType table.
const addCompany = async function addCompany(c: Context) {
	let actionResponse: MetadataActionResponse = {action: "add", isValid: false};
	const body = await c.req.parseBody();
	const companyTitle = body['metadataAddTitle'];
	const companyTypesStr = body['companyTypes'];

	if (typeof companyTypesStr !== 'string') {
		actionResponse = {
			action: "add",
			isValid: false,
			message: "Error: Invalid company type input.",
			severity: "error"
		};
	} else {
		const companyTypes = companyTypesStr.split(',');

		const insertCompany = db.transaction(() => {
			const insertCompanyName = db.prepare(`
				INSERT INTO Company (Title)
				VALUES (@Title);
			`);
			insertCompanyName.run({Title: companyTitle});

			const getCompanyID = db.prepare(`
				SELECT CompanyID FROM Company
				ORDER BY CompanyID
				DESC LIMIT 1;
			`);
			const newCompanyIDResult = getCompanyID.get() as {CompanyID: number};
			const newCompanyID = newCompanyIDResult.CompanyID;

			const insertCompanyType = db.prepare(`
				INSERT INTO CompanyCompanyType (CompanyID, CompanyTypeID)
				VALUES (@CompanyID, @CompanyTypeID);
			`);
			for (const companyType of companyTypes) insertCompanyType.run({CompanyID: newCompanyID, CompanyTypeID: companyType});
		});
		
		try {
			insertCompany();
			actionResponse = {
				action: "add",
				isValid: true,
				message: "Company successfully added to the database!",
				severity: "success"
			};
		} catch (err) {
			actionResponse = {
				action: "add",
				isValid: false,
				message: "Error: There was a problem adding the company to the database; " + err,
				severity: "error"
			};
		}
	}

	return c.json(actionResponse);
}
	// Removes selected companies from the Company table and other connected tables (GameCompany, CompanyCompanyType).
const removeCompanies = async function removeCompanies(c: Context) {
	let actionResponse: MetadataActionResponse = {action: "remove", isValid: false};
	const body = await c.req.parseBody();
	const selectedCompaniesString = body['editMetadataRemove'];
	if (typeof selectedCompaniesString !== 'string') {
		actionResponse = {
			action: "remove",
			isValid: false,
			message: "Error: Invalid company selection input.",
			severity: "error"
		};
	} else if (selectedCompaniesString.length == 0) {
		actionResponse = {
			action: "remove",
			isValid: false,
			message: "No companies were selected for removal.",
			severity: "warning"
		}
	} else {
		const selectedCompanies = selectedCompaniesString.split(',');
		
		const deleteSelectedCompanies = db.transaction(() => {
			const deleteGameConnections = db.prepare(`
				DELETE FROM GameCompany
				WHERE CompanyID = @CompanyID;
			`);
			const deleteCompanyTypeConnections = db.prepare(`
				DELETE FROM CompanyCompanyType
				WHERE CompanyID = @CompanyID;
			`);
			const deleteCompany = db.prepare(`
				DELETE FROM Company
				WHERE CompanyID = @CompanyID;
			`);
			for (const company of selectedCompanies) {
				const companyID = parseInt(company);
				deleteGameConnections.run({CompanyID: companyID});
				deleteCompanyTypeConnections.run({CompanyID: companyID});
				deleteCompany.run({CompanyID: companyID});
			}
		});

		try {
			deleteSelectedCompanies();
			actionResponse = {
				action: "remove",
				isValid: true,
				message: "Companies successfully removed from the database!",
				severity: "success"
			};
		} catch (err) {
			actionResponse = {
				action: "remove",
				isValid: false,
				message: "Error: The selected companies could not be remove from the database; " + err,
				severity: "error"
			};
		}
	}
	
	return c.json(actionResponse);
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

	// Adds a new storefront to the Storefront table.
const addStorefront = async function addStorefront(c: Context) {
	let actionResponse: MetadataActionResponse = {action: "add", isValid: false};
	const body = await c.req.parseBody();
	const storefrontTitle = body['metadataAddTitle'];
	const storefrontWebsite = body['storefrontWebsite'];

	if (typeof storefrontTitle === 'string' && storefrontTitle.length > 0) {
		if (typeof storefrontWebsite === 'string') {
			try {
				const query = db.prepare(`
					INSERT INTO Storefront (Title, Website)
					VALUES (@Title, @Website);
				`);
				query.run({Title: storefrontTitle, Website: storefrontWebsite});
				actionResponse = {
					action: "add",
					isValid: true,
					message: "Storefront successfully added to the database!",
					severity: "success"
				};
			} catch (err) {
				actionResponse = {
					action: "add",
					isValid: false,
					message: "Error: The storefront could not be added to the database; " + err,
					severity: "error"
				};
			}
		}
	} else {
		actionResponse = {
			action: "add",
			isValid: false,
			message: "Error: The storefront name must not be empty",
			severity: "error"
		};
	}
	
	return c.json(actionResponse);
}
	// Removes selected storefront(s) from the Storefront table and other connected tables (GameStorefront).
const removeStorefronts = async function removeStorefronts(c: Context) {
	let actionResponse: MetadataActionResponse = {action: "remove", isValid: false};
	const body = await c.req.parseBody();
	const selectedStorefrontsString = body['editMetadataRemove'];
	if (typeof selectedStorefrontsString !== 'string') {
		actionResponse = {
			action: "remove",
			isValid: false,
			message: "Error: Invalid storefront selection input.",
			severity: "error"
		};
	} else if (selectedStorefrontsString.length == 0) {
		actionResponse = {
			action: "remove",
			isValid: false,
			message: "No storefront(s) were selected for removal.",
			severity: "warning"
		}
	} else {
		const selectedStorefronts = selectedStorefrontsString.split(',');
		
		const deleteSelectedStorefronts = db.transaction(() => {
			const deleteGameConnections = db.prepare(`
				DELETE FROM GameStorefront
				WHERE StorefrontID = @StorefrontID;
			`);
			const deleteStorefront = db.prepare(`
				DELETE FROM Storefront
				WHERE StorefrontID = @StorefrontID;
			`);
			for (const company of selectedStorefronts) {
				const storefrontID = parseInt(company);
				deleteGameConnections.run({StorefrontID: storefrontID});
				deleteStorefront.run({StorefrontID: storefrontID});
			}
		});

		try {
			deleteSelectedStorefronts();
			actionResponse = {
				action: "remove",
				isValid: true,
				message: "Storefront(s) successfully removed from the database!",
				severity: "success"
			};
		} catch (err) {
			actionResponse = {
				action: "remove",
				isValid: false,
				message: "Error: The selected storefront(s) could not be remove from the database; " + err,
				severity: "error"
			};
		}
	}
	
	return c.json(actionResponse);
}

// Media formats ------------------------------------------------------------
const getMediaFormats = async function getMediaFormats(c: Context) {
	const query = db.prepare(`
		SELECT * FROM MediaFormat;
		`);
	const mediaFormats = query.all();
	return c.json(mediaFormats);
}


export {getGenres, addGenre, removeGenres,
		getPlatforms, addPlatform, removePlatforms,
		getCompanies, getPlatformOwners, getDevelopers, getPublishers, getCompanyTypes, addCompany, removeCompanies,
		getStorefronts, addStorefront, removeStorefronts,
		getMediaFormats};