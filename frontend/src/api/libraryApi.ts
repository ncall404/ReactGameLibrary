// API calls for data related to the user's game libraries.

const baseApiUrl = "http://localhost:3000/api/libraries";

// Get a list of the available libraries.
const getLibraryList = async () => {
	// TODO: Implement
}

// Get the games from all game libraries.
const getAllLibraries = async () => {
	// TODO: Implement
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


export {getLibraryList, getAllLibraries, getSingleLibrary};