// API server for the game library app. Allows front-end interaction with the sqlite database.

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { setupDb, resetDb } from './dbSetup.ts';
import { setupImageStorage, clearImageStorage } from './imageStorageSetup.ts';

// Import routes
import { getGamesLibrary } from './routes/libraries.ts';

const app = new Hono();
app.use(cors());

// Database check to see if it is set up, if not then it runs the setup process.
console.log(setupDb());
console.log(await setupImageStorage("./uploads/images"));

// Get list of games belonging to a library.
app.get('/api/libraries/:libraryId/games', getGamesLibrary);

serve({
	fetch: app.fetch,
	port: 3000
}, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`);
});
