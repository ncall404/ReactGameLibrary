// API calls for getting and setting game metadata such as genres, platforms, etc.

const baseApiUrl = "http://localhost:3000/api/metadata";

const MetadataField = {
	Genres: "genres",
	Platforms: "platforms",
	Companies: "companies",
	CompanyType: "company-types",
	Developers: "developers",
	Publishers: "publishers",
	PlatformOwners: "platform-owners",
	Storefronts: "storefronts",
} as const;
type MetadataField = (typeof MetadataField)[keyof typeof MetadataField];

const getMetadata = async (field: MetadataField) => {
	const res = await fetch(baseApiUrl + '/' + field);
	if (!res.ok) {
		throw new Error("Network response was not OK");
	}
	const data = await res.json();
	return data;
}

export {MetadataField, getMetadata};