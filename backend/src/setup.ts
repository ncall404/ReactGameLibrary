// Backend setup file. Sets up the database tables and image paths if they are not found or if a reset requested.

// Check if tables exist in the database. Returns boolean; true if all tables exist, false otherwise.
/* 
NOTE: There should be either no tables missing if the database was set up successfully in the past, or all tables missing from not being set up. If there is somehow only partial tables and data lost from subsequent table dropping, then it is a 99% chance that the user poked around and deleted a table or there was an error in the initial setup meaning it needs to be done again anyways. 
*/
function checkTables(db:any): boolean {
	const query = db.prepare("SELECT tbl_name FROM sqlite_schema WHERE type='table' AND NOT name='sqlite_sequence'");
	const tables = query.all();
	
	// Array of table names to check for.
	const tableNames = ["CompanyType", "Company", "Game", "Library", "Wishlist", "Genre", "Platform", "Storefront",
						"GameLibrary", "GameWishlist", "GameGenre", "GamePlatform", "GameStorefront"];

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

// Creates the database tables and 
function createTables(db: any) {
	let query;
	// Drop existing tables. (For reset functionality and fixing prior incomplete database table creation).
	query = db.prepare('DROP TABLE IF EXISTS GameLibrary;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS GameWishilst;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS GameGenre;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS GamePlatform;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS GameStorefront;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS Game;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS Platform;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS Company;');
	query.run();
	query = db.prepare('DROP TABLE IF EXISTS CompanyType;');
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
		CompanyType TEXT UNIQUE NOT NULL
		);`
	);
	query.run();
	// Company
	query = db.prepare(`CREATE TABLE Company (
		CompanyID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT UNIQUE NOT NULL,
		CompanyTypeID INTEGER NOT NULL,
		FOREIGN KEY (CompanyTypeID) REFERENCES CompanyType(CompanyTypeID)
		);`
	);
	query.run();
	// Game
	// -- CoverArt was BLOB; changed to TEXT that stores file location on backend.
	query = db.prepare(`CREATE TABLE Game (
		GameID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT NOT NULL,
		Description TEXT,
		ReleaseDate INTEGER NOT NULL,
		CoverArt BLOB,
		DeveloperID INTEGER,
		PublisherID INTEGER,
		FOREIGN KEY (DeveloperID) REFERENCES Company(CompanyID),
		FOREIGN KEY (PublisherID) REFERENCES Company(CompanyID)
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
		FOREIGN KEY (GameID) references Game(GameID),
		FOREIGN KEY (LibraryID) references Library(LibraryID)
		);`
	);
	query.run();
	// GameWishlist
	query = db.prepare(`CREATE TABLE GameWishlist (
		GameID INTEGER,
		WishlistID INTEGER,
		PRIMARY KEY (GameID, WishlistID),
		FOREIGN KEY (GameID) references Game(GameID),
		FOREIGN KEY (WishlistID) references Wishlist(WishlistID)
		);`
	);
	query.run();
	// GameGenre
	query = db.prepare(`CREATE TABLE GameGenre (
		GameID INTEGER,
		GenreID INTEGER,
		PRIMARY KEY (GameID, GenreID),
		FOREIGN KEY (GameID) references Game(GameID),
		FOREIGN KEY (GenreID) references Genre(GenreID)
		);`
	);
	query.run();
	// GamePlatform
	query = db.prepare(`CREATE TABLE GamePlatform (
		GameID INTEGER,
		PlatformID INTEGER,
		PRIMARY KEY (GameID, PlatformID),
		FOREIGN KEY (GameID) references Game(GameID),
		FOREIGN KEY (PlatformID) references Platform(PlatformID)
		);`
	);
	query.run();
	// GameStorefront
	query = db.prepare(`CREATE TABLE GameStorefront (
		GameID INTEGER,
		PlatformID INTEGER,
		StorefrontID INTEGER,
		PRIMARY KEY (GameID, PlatformID, StorefrontID),
		FOREIGN KEY (GameID) references Game(GameID),
		FOREIGN KEY (PlatformID) references Platform(PlatformID),
		FOREIGN KEY (StorefrontID) references Storefront(StorefrontID)
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
	const insertCompanyTypes = db.prepare('INSERT INTO CompanyType (CompanyType) VALUES (@CompanyType);');
	const insertManyCompanyTypes = db.transaction((types: any) => {
		for (const type of types) insertCompanyTypes.run(type);
	});
	insertManyCompanyTypes([
		{CompanyType: 'Platform'},
		{CompanyType: 'Developer'},
		{CompanyType: 'Publisher'},
	]);
	// Common Companies
	const insertCompanies = db.prepare('INSERT INTO Company (Title, CompanyTypeID) VALUES (@Title, @CompanyTypeID);');
	const insertManyCompanies = db.transaction((companies: any) => {
		for (const company of companies) insertCompanies.run(company);
	});
	insertManyCompanies([
		{Title: 'None', CompanyTypeID: 1},
		{Title: 'Google', CompanyTypeID: 1},
		{Title: 'Apple', CompanyTypeID: 1},
		{Title: 'Nintendo', CompanyTypeID: 1},
		{Title: 'Sony', CompanyTypeID: 1},
		{Title: 'Microsoft', CompanyTypeID: 1},
		{Title: 'Sega', CompanyTypeID: 1},
		{Title: 'Atari', CompanyTypeID: 1},
	]);
	// Common Platforms
	const insertPlatforms = db.prepare('INSERT INTO Platform (Title, CompanyID) VALUES (@Title, @CompanyID);');
	const insertManyPlatforms = db.transaction((platforms: any) => {
		for (const platform of platforms) insertPlatforms.run(platform);
	});
	insertManyPlatforms([
		// PC
		{Title: 'Desktop', CompanyID: 1},
		// Mobile
		{Title: 'Android', CompanyID: 2},
		{Title: 'IOS', CompanyID: 3},
		// Nintendo
		{Title: 'Switch 2', CompanyID: 4},
		{Title: 'Switch', CompanyID: 4},
		{Title: 'Wii U', CompanyID: 4},
		{Title: 'Nintendo 3DS/2DS', CompanyID: 4},
		{Title: 'Wii', CompanyID: 4},
		{Title: 'Nintendo DS', CompanyID: 4},
		{Title: 'Gamecube', CompanyID: 4},
		{Title: 'Game Boy Advance', CompanyID: 4},
		{Title: 'N64', CompanyID: 4},
		{Title: 'Super Nintendo Entertainment System', CompanyID: 4},
		{Title: 'Game Boy', CompanyID: 4},
		{Title: 'Nintendo Entertainment System', CompanyID: 4},
		// Sony
		{Title: 'PlayStation 5', CompanyID: 5},
		{Title: 'PlayStation 4', CompanyID: 5},
		{Title: 'PlayStation Vita', CompanyID: 5},
		{Title: 'PlayStation 3', CompanyID: 5},
		{Title: 'PlayStation Portable', CompanyID: 5},
		{Title: 'PlayStation 2', CompanyID: 5},
		{Title: 'Sony PlayStation', CompanyID: 5},
		// Microsoft
		{Title: 'Xbox Series X/S', CompanyID: 6},
		{Title: 'Xbox One', CompanyID: 6},
		{Title: 'Xbox 360', CompanyID: 6},
		{Title: 'Xbox', CompanyID: 6},
		// Sega
		{Title: 'Dreamcast', CompanyID: 7},
		{Title: 'Sega Nomad', CompanyID: 7},
		{Title: 'Sega Saturn', CompanyID: 7},
		{Title: 'Game Gear', CompanyID: 7},
		{Title: 'Sega Genesis/Mega Drive', CompanyID: 7},
		{Title: 'Sega SG-1000', CompanyID: 7},
		// Atari
		{Title: 'Atari VCS', CompanyID: 8},
		{Title: 'Atari Jaguar', CompanyID: 8},
		{Title: 'Atari Lynx', CompanyID: 8},
		{Title: 'Atari 7800', CompanyID: 8},
		{Title: 'Atari 5200', CompanyID: 8},
		{Title: 'Atari 2600', CompanyID: 8},
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
		{Title: 'Action-Adventure'},
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
	])
}

// Checks database table existence. If the amount of tables isn't right, then setup the database.
const setupDb = function setupDb(db:any): string {
	let tablesExist: boolean;
	try {
		tablesExist = checkTables(db);
	} catch(err) {
		return "Error: Couldn't verify the database; " + err;
	}

	if (!tablesExist) {
		try {
			createTables(db);
		} catch(err) {
			return "Error: Database creation failed; " + err;
		}
		return "Success: Database created!"
	}
	return "Success: Database already existed."
}

// Resets the database tables and removes all images from the image paths.
const resetDb = function resetDb(db: any) {
	try {
		createTables(db);
	} catch(err) {
		return "Error: Database reset failed; " + err;
	}
	return "Success: Database reset!";
}

export {setupDb, resetDb};