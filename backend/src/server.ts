// API server for the game library app. Allows front-end interaction with the sqlite database.

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Database from 'better-sqlite3';
import path from 'path';

const app = new Hono();
app.use(cors());

const db = new Database(path.join('data', 'game_collection.db')); // Create database object for the game_collection database.

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
