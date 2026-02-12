import type { Context } from "hono";
import { db } from "../dbManager.ts";
import type { BackendResponse } from '../server.ts';

import { upperFirstLetter } from "../utilities.ts";

// Get all libraries.
const getLibraries = function getLibraries(c: Context) {
	const query = db.prepare("SELECT * FROM Library");
	const libraries = query.all();
	return c.json(libraries);
}

// Get all wishlists.
const getWishlists = function getWishlists(c: Context) {
	const query = db.prepare("SELECT * FROM Wishlist");
	const wishlists = query.all();
	return c.json(wishlists);
}


// Table name whitelist lookup object.
const tableWhitelist = {
	library: "Library",
	wishlist: "Wishlist"
} as const;

// Add a collection.
const addCollection = async function addCollection(c: Context) {
	const response: BackendResponse = {
		message: "Adding collection not completed.",
		status: "error"
	};

	const body = await c.req.parseBody();
	const collectionType = body['collectionType'] as keyof typeof tableWhitelist;
	const collectionTitle = body['collectionAddTitle'] as string;

	// Verify that a collection title was provided by the user.
	if (collectionTitle.length <= 0) {
		response.message = `No ${collectionType} name was provided.`;
		return c.json(response);
	}

	// Check if the collection name is already in use so that a number can be added to the end to differentiate it.
	const checkCollectionsQuery = db.prepare(`
		SELECT COUNT(*) as Count FROM ${upperFirstLetter(collectionType)}
		WHERE substr(lower(Title), 1, length(lower(@NewTitle))) = lower(@NewTitle);
	`);
	const numCollectionName = checkCollectionsQuery.get({NewTitle: collectionTitle}) as {Count: number};

	// Actually create the new collection.
	const addCollectionTransaction = db.transaction(() => {
		const addCollectionQuery = db.prepare(`
			INSERT INTO ${upperFirstLetter(collectionType)} (Title)
			VALUES (@Title);
		`);

		addCollectionQuery.run({Title: numCollectionName.Count > 0 ? collectionTitle.concat(` ${numCollectionName.Count + 1}`) : collectionTitle});
	});

	try {
		addCollectionTransaction();
		if (numCollectionName.Count > 0) {
			response.message = `Created the ${collectionType} successfully. Name changed to "${collectionTitle.concat(` ${numCollectionName.Count + 1}`)}" to avoid duplicate naming.`;
			response.status = "informative";
		} else {
			response.message = `Created the ${collectionType} "${collectionTitle}" successfully.`;
			response.status = "success";
		}
	} catch (err) {
		response.message = `Error creating the ${collectionType}: + ${err}`;
	}

	return c.json(response);
}

// Remove a collection.
const removeCollection = async function removeCollection(c: Context) {
	const response: BackendResponse = {
		message: "Removing collection not completed.",
		status: "error"
	};

	const body = await c.req.parseBody();
	const collectionType = body['collectionType'] as keyof typeof tableWhitelist;
	const selectedCollectionsString = body['collectionRemove'] as string;

	if (selectedCollectionsString.length == 0) {
		response.message = "No options were selected for removal.";
		response.status = "warning";
	} else {
		const selectedCollections = selectedCollectionsString.split(',');

		const deleteSelectedCollections = db.transaction(() => {
			const deleteGameConnection = db.prepare(`
				DELETE FROM ${"Game".concat(upperFirstLetter(collectionType))}
				WHERE ${tableWhitelist[collectionType] + "ID"} = @CollectionID;
			`);
			const deleteCollection = db.prepare(`
				DELETE FROM ${upperFirstLetter(collectionType)}
				WHERE ${tableWhitelist[collectionType] + "ID"} = @CollectionID;
			`);

			for (const collection of selectedCollections) {
				const collectionID = parseInt(collection);
				deleteGameConnection.run({CollectionID: collectionID});
				deleteCollection.run({CollectionID: collectionID});
			}
		});

		try {
			deleteSelectedCollections();
			response.message = `${upperFirstLetter(collectionType)}(s) successfully removed.`;
			response.status = "success";
		} catch (err) {
			response.message = `Error deleting the ${collectionType}: ${err}`;
		}
	}

	return c.json(response);
}


export {getLibraries, getWishlists, addCollection, removeCollection};