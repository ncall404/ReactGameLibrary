import type { Context } from "hono";
import { db } from "../dbManager.ts";

const addGameToLibrary = async function addGameToLibrary(c: Context) {
	const body = await c.req.parseBody();
	// TODO: Finish implementation!

	return c.json({message: "Success!"});
}

export {addGameToLibrary};