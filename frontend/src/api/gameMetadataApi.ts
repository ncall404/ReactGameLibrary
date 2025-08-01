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

const getPlatforms = async () => {
	const res = await fetch(baseApiUrl + '/platforms');
	if (!res.ok) {
		throw new Error("Network response was not OK");
	}
	const data = await res.json();
	return data;
}

const getCompanies = async () => {
	const res = await fetch(baseApiUrl + '/companies');
	if (!res.ok) {
		throw new Error("Network response was not OK");
	}
	const data = await res.json();
	return data;
}

const getDevelopers = async () => {
	const res = await fetch(baseApiUrl + '/developers');
	if (!res.ok) {
		throw new Error("Network response was not OK");
	}
	const data = await res.json();
	return data;
}

const getPublishers = async () => {
	const res = await fetch(baseApiUrl + '/publishers');
	if (!res.ok) {
		throw new Error("Network response was not OK");
	}
	const data = await res.json();
	return data;
}

export {getGenres, getPlatforms, getCompanies, getDevelopers, getPublishers};