// API server for the game library app. Allows front-end interaction with the sqlite database.

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';

import { setupDb, resetDb } from './dbManager.ts';
import { setupImageStorage, clearImageStorage } from './imageStorageManager.ts';

// Import route handlers
import { getGamesLibrary } from './handlers/libraries.ts';
import { getGenres } from './handlers/gameMetadata.ts';

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

// Get a list of all stored genres.
app.get('/api/metadata/genres', getGenres);

serve({
	fetch: app.fetch,
	port: 3000
}, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`);
});
