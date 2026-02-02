// API server for the game library app. Allows front-end interaction with the sqlite database.

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';

import { setupDb } from './dbManager.ts';

// Import route handlers
import { getGamesLibrary } from './handlers/libraries.ts';
import { getLibraries, getWishlists, addCollection, removeCollection } from './handlers/collections.ts';
import { getGenres, addGenre, removeGenres,
		getPlatforms, addPlatform, removePlatforms,
		getCompanies, getPlatformOwners, getDevelopers, getPublishers, getCompanyTypes, addCompany, removeCompanies,
		getStorefronts, addStorefront, removeStorefronts,
		getMediaFormats } from './handlers/gameMetadata.ts';
import { createGame, editGame, deleteGame, getGameData } from './handlers/games.ts';
import { resetApp } from './handlers/settings.ts';

const app = new Hono();
app.use(cors());

// Database check to see if it is set up, if not then it runs the setup process.
console.log((await setupDb()).message);


// Serve images from ./uploads/images or a placeholder if the requested image is not available.
app.use('/images/*', serveStatic({
	root: './images',
	rewriteRequestPath: (path) => path.replace(/^\/images\//, ''),
}));
app.notFound(async (c) => {
	// If an image is requested but not found, give a fallback image.
	if (c.req.path.startsWith('/images/')) {
		const fallbackRes = await serveStatic({
			root: './images',
			path: 'static/fallback/ImageNotFoundFallback-256.avif',
		})(c, async () => {});
		// Double check that the fallback image was found.
		if (fallbackRes instanceof Response && fallbackRes.status === 200) {
			return fallbackRes;
		}
		// If the fallback is missing for some reason.
		console.error("Fallback image not found.")
		return c.text('Fallback image not found.', 404);
	}

	// For non-image failures.
	return c.text ('404 Not Found', 404);
});

// ==========================================================================
// GET handlers =============================================================
// ==========================================================================
// Get list of games belonging to a library. 
app.get('/api/libraries/:libraryId/games', getGamesLibrary);

// Get a list of all stored libraries.
app.get('/api/collections/libraries', getLibraries);
// Get a list of all stored wishlists.
app.get('/api/collections/wishlists', getWishlists);

// Get the data for a single game.
app.get('api/game/:gameID', getGameData);

// Get a list of all stored genres.
app.get('/api/metadata/genres', getGenres);
// Get a list of all stored platforms.
app.get('/api/metadata/platforms', getPlatforms);
// Get a list of all stored companies and their company types.
app.get('/api/metadata/companies', getCompanies);
// Get a list of all stored companies with the platform type.
app.get('/api/metadata/platform-owners', getPlatformOwners);
// Get a list of all stored companies with the developer type.
app.get('/api/metadata/developers', getDevelopers);
// Get a list of all stored companies with the publisher type.
app.get('/api/metadata/publishers', getPublishers);
// Get a list of all company types.
app.get('/api/metadata/company-types', getCompanyTypes);
// Get a list of all stored storefronts.
app.get('/api/metadata/storefronts', getStorefronts);
// Get a list of all stored media formats
app.get('/api/metadata/media-format', getMediaFormats);

// ==========================================================================
// POST handlers ============================================================
// ==========================================================================
// Add a game to the database.
app.post('/api/games/create', createGame);
// Delete a game from the database.
app.post('/api/games/delete', deleteGame);
// Edit a game in the database.
app.post('/api/games/edit', editGame);

// Add a new collection.
app.post('/api/collections/add', addCollection);
// Remove a collection.
app.post('/api/collections/remove', removeCollection);

// Create Metadata ==========================================================
	// Create a new genre and add it to the stored genres.
app.post('/api/metadata/genres/add', addGenre);
	// Create a new company and add it to the stored companies.
app.post('/api/metadata/companies/add', addCompany);
	// Create a new platform and add it to the stored platforms.
app.post('/api/metadata/platforms/add', addPlatform);
	// Create a new storefront and add it to the stored storefronts.
app.post('/api/metadata/storefronts/add', addStorefront);
// Remove Metadata ==========================================================
	// Remove genres from the stored genres.
app.post('/api/metadata/genres/remove', removeGenres);
	// Remove companies from the stored companies.
app.post('/api/metadata/companies/remove', removeCompanies);
	// Remove platforms from the stored platforms.
app.post('/api/metadata/platforms/remove', removePlatforms);
	// Remove storefronts from the stored storefronts.
app.post('/api/metadata/storefronts/remove', removeStorefronts);

// Reset App Database/Image Storage =========================================
app.post('/api/settings/reset-app', resetApp);

serve({
	fetch: app.fetch,
	port: 3000
}, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`);
});
