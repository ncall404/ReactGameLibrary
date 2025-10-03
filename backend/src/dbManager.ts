// Backend setup file. Creates database object. Sets up the database tables if they are not found or if a reset is requested.

import Database from 'better-sqlite3';
import path from 'path';

// Create database object for the game_collection database. If game_collection.db is missing then it is created.
const db = new Database(path.join('data', 'game_collection.db'));

// Check if tables exist in the database. Returns boolean; true if all tables exist, false otherwise.
/* 
NOTE: There should be either no tables missing if the database was set up successfully in the past, or all tables missing from not being set up. If there is somehow only partial tables and data lost from subsequent table dropping, then it is a 99% chance that the user poked around and deleted a table or there was an error in the initial setup meaning it needs to be done again anyways. 
*/
function checkTables(): boolean {
	const query = db.prepare("SELECT tbl_name FROM sqlite_schema WHERE type='table' AND NOT name='sqlite_sequence'");
	const tables: any[] = query.all();
	
	// Array of table names to check for.
	const tableNames = ["CompanyType",  "CompanyRole", "Company", "MediaFormat", "Game", "Library", "Wishlist", "Genre", "Platform", "Storefront",
						"GameLibrary", "GameWishlist", "GameGenre", "GamePlatform", "GameStorefront", "CompanyCompanyType", "GameCompany"];

	// Check existence of tables.
	for (let table of tableNames) {
		let isMatch = false;
		for (let t of tables) {
			isMatch = t.tbl_name === table;
			if (isMatch) { break; } // Stop loop if a match is found.
		}
		if (isMatch === false) { return false; } // Return false if a table without a match is found.
	}
	return true;
}

// TODO: Wrap createTables queries in a transaction. Wrap table dropping, table creation, and default value insertions into separate transactions.

// Creates the database tables and inserts data into relevant tables.
function createTables() {
	let query;
	// Drop existing tables. (For reset functionality and fixing prior incomplete database table creation).
		// Junction tables:
	query = db.prepare('DROP TABLE IF EXISTS GameLibrary;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS GameWishlist;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS GameGenre;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS GamePlatform;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS GameStorefront;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS CompanyCompanyType;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS GameCompany;');
	query.run();
		// Core tables:
	query = db.prepare('DROP TABLE IF EXISTS Game;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS MediaFormat');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS Platform;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS Company;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS CompanyType;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS CompanyRole;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS Library;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS Wishlist;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS Genre;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS Storefront;');
	query.run();

	// Creation of Core Tables ----------------------------------------------
	// CompanyType
	query = db.prepare(`CREATE TABLE CompanyType (
		CompanyTypeID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL
		);`
	);
	query.run();
	// CompanyRole
	query = db.prepare(`CREATE TABLE CompanyRole (
		CompanyRoleID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL
		);`
	);
	query.run();
	// Company
	query = db.prepare(`CREATE TABLE Company (
		CompanyID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL
		);`
	);
	query.run();
	// MediaFormat
	query = db.prepare(`CREATE TABLE MediaFormat (
		MediaFormatID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL
		);`
	);
	query.run();
	// Game
	query = db.prepare(`CREATE TABLE Game (
		GameID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT NOT NULL,
		Description TEXT,
		ReleaseDate INTEGER NOT NULL,
		CoverArt TEXT,
		MediaFormatID INTEGER,
		FOREIGN KEY (MediaFormatID) REFERENCES MediaFormat(MediaFormatID)
		);`
	);
	query.run();
	// Library
	query = db.prepare(`CREATE TABLE Library (
		LibraryID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL
		);`
	);
	query.run();
	// Wishlist
	query = db.prepare(`CREATE TABLE Wishlist (
		WishlistID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL
		);`
	);
	query.run();
	// Genre
	query = db.prepare(`CREATE TABLE Genre (
		GenreID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL
		);`
	);
	query.run();
	// Platform
	query = db.prepare(`CREATE TABLE Platform (
		PlatformID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL,
		CompanyID INTEGER,
		FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID)
		);`
	);
	query.run();
	// Storefront
	query = db.prepare(`CREATE TABLE Storefront (
		StorefrontID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL,
		Website TEXT NOT NULL
		);`
	);
	query.run();

	// Creation of Junction Tables ------------------------------------------
	// GameLibrary
	query = db.prepare(`CREATE TABLE GameLibrary (
		GameID INTEGER,
		LibraryID INTEGER,
		PRIMARY KEY (GameID, LibraryID),
		FOREIGN KEY (GameID) REFERENCES Game(GameID),
		FOREIGN KEY (LibraryID) REFERENCES Library(LibraryID)
		);`
	);
	query.run();
	// GameWishlist
	query = db.prepare(`CREATE TABLE GameWishlist (
		GameID INTEGER,
		WishlistID INTEGER,
		PRIMARY KEY (GameID, WishlistID),
		FOREIGN KEY (GameID) REFERENCES Game(GameID),
		FOREIGN KEY (WishlistID) REFERENCES Wishlist(WishlistID)
		);`
	);
	query.run();
	// GameGenre
	query = db.prepare(`CREATE TABLE GameGenre (
		GameID INTEGER,
		GenreID INTEGER,
		PRIMARY KEY (GameID, GenreID),
		FOREIGN KEY (GameID) REFERENCES Game(GameID),
		FOREIGN KEY (GenreID) REFERENCES Genre(GenreID)
		);`
	);
	query.run();
	// GamePlatform
	query = db.prepare(`CREATE TABLE GamePlatform (
		GameID INTEGER,
		PlatformID INTEGER,
		PRIMARY KEY (GameID, PlatformID),
		FOREIGN KEY (GameID) REFERENCES Game(GameID),
		FOREIGN KEY (PlatformID) REFERENCES Platform(PlatformID)
		);`
	);
	query.run();
	// GameStorefront
	query = db.prepare(`CREATE TABLE GameStorefront (
		GameID INTEGER,
		PlatformID INTEGER,
		StorefrontID INTEGER,
		PRIMARY KEY (GameID, PlatformID, StorefrontID),
		FOREIGN KEY (GameID) REFERENCES Game(GameID),
		FOREIGN KEY (PlatformID) REFERENCES Platform(PlatformID),
		FOREIGN KEY (StorefrontID) REFERENCES Storefront(StorefrontID)
		);`
	);
	query.run();
	// CompanyCompanyType										
	query = db.prepare(`CREATE TABLE CompanyCompanyType (
		CompanyID INTEGER,
		CompanyTypeID INTEGER,
		PRIMARY KEY (CompanyID, CompanyTypeID),
		FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID),
		FOREIGN KEY (CompanyTypeID) REFERENCES CompanyType(CompanyTypeID)
		);`
	);
	query.run();
	// GameCompany
	query = db.prepare(`CREATE TABLE GameCompany (
		GameID INTEGER,
		CompanyID INTEGER,
		CompanyRoleID INTEGER,
		PRIMARY KEY (GameID, CompanyID, CompanyRoleID),
		FOREIGN KEY (GameID) REFERENCES Game(GameID),
		FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID),
		FOREIGN KEY (CompanyRoleID) REFERENCES CompanyRole(CompanyRoleID)
		);`
	);
	query.run();
	 
	// ----------------------------------------------------------------------
	// Inserting Default Table Data -----------------------------------------
	// ----------------------------------------------------------------------
	// Default Library
	query = db.prepare("INSERT INTO Library (Title) VALUES ('My Collection');");
	query.run();
	// Default Wishlist
	query = db.prepare("INSERT INTO Wishlist (Title) VALUES ('My Wishlist');");
	query.run();
	// Common Company Types
	const insertCompanyTypes = db.prepare('INSERT INTO CompanyType (Title) VALUES (@Title);');
	const insertManyCompanyTypes = db.transaction((types: any) => {
		for (const type of types) insertCompanyTypes.run(type);
	});
	insertManyCompanyTypes([
		{Title: 'Platform'},
		{Title: 'Developer'},
		{Title: 'Publisher'},
	]);
	// Common Company Roles
	const insertCompanyRoles = db.prepare(`INSERT INTO CompanyRole (Title) VALUES (@Title);`)
	const insertManyCompanyRoles = db.transaction((roles: any) => {
		for (const role of roles) insertCompanyRoles.run(role);
	});
	insertManyCompanyRoles([
		{Title: 'Developer'},
		{Title: 'Publisher'},
	]);
	// Common Companies
	const insertCompanies = db.prepare('INSERT INTO Company (Title) VALUES (@Title);');
	const insertManyCompanies = db.transaction((companies: any) => {
		for (const company of companies) insertCompanies.run(company);
	});
	insertManyCompanies([
		{Title: 'Google'},
		{Title: 'Apple'},
		{Title: 'Nintendo'},
		{Title: 'Sony'},
		{Title: 'Microsoft'},
		{Title: 'Sega'},
		{Title: 'Atari'},
	]);
	// Common Company's Types
	const insertCompanyCompanyTypes = db.prepare('INSERT INTO CompanyCompanyType (CompanyID, CompanyTypeID) VALUES (@CompanyID, @CompanyTypeID);');
	const insertManyCompanyCompanyTypes = db.transaction((companyCompanyTypes: any) => {
		for (const companyCompanyType of companyCompanyTypes) insertCompanyCompanyTypes.run(companyCompanyType);
	});
	insertManyCompanyCompanyTypes([
		{CompanyID: 1, CompanyTypeID: 1},
		{CompanyID: 2, CompanyTypeID: 1},
		{CompanyID: 3, CompanyTypeID: 1},
		{CompanyID: 3, CompanyTypeID: 2},
		{CompanyID: 3, CompanyTypeID: 3},
		{CompanyID: 4, CompanyTypeID: 1},
		{CompanyID: 4, CompanyTypeID: 2},
		{CompanyID: 4, CompanyTypeID: 3},
		{CompanyID: 5, CompanyTypeID: 1},
		{CompanyID: 5, CompanyTypeID: 2},
		{CompanyID: 5, CompanyTypeID: 3},
		{CompanyID: 6, CompanyTypeID: 1},
		{CompanyID: 6, CompanyTypeID: 2},
		{CompanyID: 6, CompanyTypeID: 3},
		{CompanyID: 7, CompanyTypeID: 1},
		{CompanyID: 7, CompanyTypeID: 2},
		{CompanyID: 7, CompanyTypeID: 3}
	]);
	// Common Platforms
	const insertPlatforms = db.prepare('INSERT INTO Platform (Title, CompanyID) VALUES (@Title, @CompanyID);');
	const insertManyPlatforms = db.transaction((platforms: any) => {
		for (const platform of platforms) insertPlatforms.run(platform);
	});
	insertManyPlatforms([
		// PC
		{Title: 'Desktop', CompanyID: null},
		// Mobile
		{Title: 'Android', CompanyID: 1},
		{Title: 'IOS', CompanyID: 2},
		// Nintendo
		{Title: 'Switch 2', CompanyID: 3},
		{Title: 'Switch', CompanyID: 3},
		{Title: 'Wii U', CompanyID: 3},
		{Title: 'Nintendo 3DS/2DS', CompanyID: 3},
		{Title: 'Wii', CompanyID: 3},
		{Title: 'Nintendo DS', CompanyID: 3},
		{Title: 'Gamecube', CompanyID: 3},
		{Title: 'Game Boy Advance', CompanyID: 3},
		{Title: 'N64', CompanyID: 3},
		{Title: 'Super Nintendo Entertainment System', CompanyID: 3},
		{Title: 'Game Boy', CompanyID: 3},
		{Title: 'Nintendo Entertainment System', CompanyID: 3},
		// Sony
		{Title: 'PlayStation 5', CompanyID: 4},
		{Title: 'PlayStation 4', CompanyID: 4},
		{Title: 'PlayStation Vita', CompanyID: 4},
		{Title: 'PlayStation 3', CompanyID: 4},
		{Title: 'PlayStation Portable', CompanyID: 4},
		{Title: 'PlayStation 2', CompanyID: 4},
		{Title: 'Sony PlayStation', CompanyID: 4},
		// Microsoft
		{Title: 'Xbox Series X/S', CompanyID: 5},
		{Title: 'Xbox One', CompanyID: 5},
		{Title: 'Xbox 360', CompanyID: 5},
		{Title: 'Xbox', CompanyID: 5},
		// Sega
		{Title: 'Dreamcast', CompanyID: 6},
		{Title: 'Sega Nomad', CompanyID: 6},
		{Title: 'Sega Saturn', CompanyID: 6},
		{Title: 'Game Gear', CompanyID: 6},
		{Title: 'Sega Genesis/Mega Drive', CompanyID: 6},
		{Title: 'Sega SG-1000', CompanyID: 6},
		// Atari
		{Title: 'Atari VCS', CompanyID: 7},
		{Title: 'Atari Jaguar', CompanyID: 7},
		{Title: 'Atari Lynx', CompanyID: 7},
		{Title: 'Atari 7800', CompanyID: 7},
		{Title: 'Atari 5200', CompanyID: 7},
		{Title: 'Atari 2600', CompanyID: 7},
	]);
	// Common Storefronts
	const insertStorefronts = db.prepare('INSERT INTO Storefront (Title, Website) VALUES (@Title, @Website);');
	const insertManyStorefronts = db.transaction((storefronts: any) => {
		for (const storefront of storefronts) insertStorefronts.run(storefront);
	});
	insertManyStorefronts([
		{Title: 'Nintendo', Website: 'https://www.nintendo.com/us/store/games/'},
		{Title: 'Xbox', Website: 'https://www.xbox.com/en-US/games'},
		{Title: 'PlayStation 5', Website: 'https://www.playstation.com/en-us/ps5/games/'},
		{Title: 'PlayStation 4', Website: 'https://www.playstation.com/en-us/ps4/ps4-games/'},
		{Title: 'Steam', Website: 'https://store.steampowered.com/'},
		{Title: 'GOG', Website: 'https://www.gog.com/en/games'},
		{Title: 'Epic Games', Website: 'https://store.epicgames.com/en-US'},
		{Title: 'Ubisoft', Website: 'https://store.ubisoft.com/us/home?lang=en_US'},
		{Title: 'Electronic Arts', Website: 'https://www.ea.com/games'},
	]);
	// Common Genres
	const insertGenres = db.prepare('INSERT INTO Genre (Title) VALUES (@Title);');
	const insertManyGenres = db.transaction((genres: any) => {
		for (const genre of genres) insertGenres.run(genre);
	});
	insertManyGenres([
		{Title: 'Role Playing'},
		{Title: 'First Person Shooter'},
		{Title: 'Third Person Shooter'},
		{Title: 'Battle Royale'},
		{Title: 'Platformer'},
		{Title: 'Racing'},
		{Title: 'Massive Multiplayer Online'},
		{Title: 'Puzzle'},
		{Title: 'Action'},
		{Title: 'Adventure'},
		{Title: 'Metroidvania'},
		{Title: 'Sports'},
		{Title: 'Survival'},
		{Title: 'Fighting'},
		{Title: 'Beat-Em Up'},
		{Title: 'Hack and Slash'},
		{Title: 'Strategy'},
		{Title: 'Real-Time Strategy'},
		{Title: 'Sandbox'},
		{Title: 'Simulation'},
		{Title: 'Flight'},
		{Title: 'Party'},
		{Title: 'Roguelike'},
		{Title: 'Educational'},
	]);
	// Media Formats
	const insertMediaFormat = db.prepare('INSERT INTO MediaFormat (Title) VALUES (@Title);');
	const insertManyMediaFormats = db.transaction((mediaFormats: any) =>  {
		for (const mediaFormat of mediaFormats) insertMediaFormat.run(mediaFormat);
	})
	insertManyMediaFormats([
		{Title: 'Physical'},
		{Title: 'Digital'},
		{Title: 'Physical and Digital'},
	]);
}

// Checks database table existence. If the amount of tables isn't right, then setup the database.
const setupDb = function setupDb(): string {
	let tablesExist: boolean;
	try {
		tablesExist = checkTables();
	} catch(err) {
		return "Error: Couldn't verify the database; " + err;
	}

	if (!tablesExist) {
		try {
			createTables();
		} catch(err) {
			return "Error: Database creation failed; " + err;
		}
		return "Success: Database created!"
	}
	return "Success: Database already existed."
}

// Resets the database tables.
const resetDb = function resetDb() {
	try {
		createTables();
	} catch(err) {
		return "Error: Database reset failed; " + err;
	}
	return "Success: Database reset!";
}

export {db, setupDb, resetDb};