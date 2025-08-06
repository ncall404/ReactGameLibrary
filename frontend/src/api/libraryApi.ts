// API calls for data related to the user's game libraries.

const baseApiUrl = "http://localhost:3000/api/libraries"

// Get the games from all game libraries.
const getAllLibraries = async () => {
	// TODO: Implement function and rename function to be clearer about it's purpose.
}

// Get the games of a single game library.
const getSingleLibrary = async (libraryId: number) => {
	const res = await fetch(baseApiUrl + `/${libraryId}/games`);
	if (!res.ok) {
		throw new Error("Network response was not OK");
	}
	const data = await res.json();
	return data;
}


export {getAllLibraries, getSingleLibrary};