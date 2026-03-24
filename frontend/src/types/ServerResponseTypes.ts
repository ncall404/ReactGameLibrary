// Type for the object sent back from the server in response to a server request if it has no extra needs (i.e. extra data or an extra field).
type BackendResponse = {
	message: string;
	status: "success" | "warning" | "error" | "informative";
	time: number; // Length of time for the message to display.
};

// Type for the object sent back from the server in response to an attempt at uploading a game.
type GameUploadResponse = {
	message: string;
	field?: 
		"gameCollections" | "gameGenres" | "gamePlatforms" | "gameStorefronts" | "gamePublishers" | "gameDevelopers" | "gameMediaFormats" |
		"gameName" | "gameDescription" | "releaseDate" | "coverArt";
	status: "success" | "warning" | "error" | "informative";
	time: number; // Length of time for the message to display.
}

export type { BackendResponse, GameUploadResponse };