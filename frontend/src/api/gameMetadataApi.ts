// API calls for getting and setting game metadata such as genres, platforms, etc.

const baseApiUrl = "http://localhost:3000/api/metadata";

const getGenres = async () => {
	const res = await fetch(baseApiUrl + '/genres');
	if (!res.ok) {
		throw new Error("Network response was not OK");
	}
	const data = await res.json();
	return data;
}

export {getGenres};