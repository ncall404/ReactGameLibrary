// API server for the game library app. Allows front-end interaction with the sqlite database.

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Database from 'better-sqlite3';
import path from 'path';

import { setupDb, resetDb } from './dbSetup.ts';
import { setupImageStorage, clearImageStorage } from './imageStorageSetup.ts';

const app = new Hono();
app.use(cors());

// Create database object for the game_collection database. If game_collection.db is missing then it is created.
const db = new Database(path.join('data', 'game_collection.db'));

// Database check to see if it is set up, if not then it runs the setup process.
console.log(setupDb(db));
console.log(await setupImageStorage("./uploads/images"));

// Get list of games belonging to a library.
app.get('/api/libraries/:libraryId/games', (c) => {
	// TODO: Change the query to return the name of the publisher and developer companies instead of the ids?
	const libraryId = c.req.param('libraryId');
	const query = db.prepare('SELECT * FROM Game g JOIN GameLibrary gl ON g.GameID = gl.GameID WHERE gl.LibraryID = ?');
	const games = query.all(libraryId);
	return c.json(games);
});

serve({
	fetch: app.fetch,
	port: 3000
}, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`);
});
