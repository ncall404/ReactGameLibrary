// API server for the game library app. Allows front-end interaction with the sqlite database.

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';

import { setupDb, resetDb } from './dbManager.ts';
import { setupImageStorage, clearImageStorage } from './imageStorageManager.ts';

// Import route handlers
import { getGamesLibrary } from './handlers/libraries.ts';
import { getLibraries, getWishlists } from './handlers/collections.ts';
import { getGenres, addGenre, removeGenres,
		getPlatforms, addPlatform, removePlatforms,
		getCompanies, getPlatformOwners, getDevelopers, getPublishers, getCompanyTypes, addCompany, removeCompanies,
		getStorefronts, addStorefront, removeStorefronts,
		getMediaFormats } from './handlers/gameMetadata.ts';
import { addGameToLibrary } from './handlers/games.ts';

const app = new Hono();
app.use(cors());

// Serve images from ./uploads/images
// TODO: Make it so that there is a placeholder sent if the image isn't found.
app.use('/uploads/images/*', serveStatic({
	root: './uploads/images',
	rewriteRequestPath: (path) => path.replace(/^\/uploads\/images/, ''),
}));

// Database check to see if it is set up, if not then it runs the setup process.
console.log(setupDb());
console.log(await setupImageStorage("./uploads/images"));

// Get list of games belonging to a library. 
app.get('/api/libraries/:libraryId/games', getGamesLibrary);

// Get a list of all stored libraries.
app.get('/api/collections/libraries', getLibraries);
// Get a list of all stored wishlists.
app.get('/api/collections/wishlists', getWishlists);
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
app.get('/api/metadata/media-formats', getMediaFormats);

// Create a new game and add it to a library.
app.post('/api/games/add/library', addGameToLibrary);

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

serve({
	fetch: app.fetch,
	port: 3000
}, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`);
});
