// API calls for data related to the user's collections.

const CollectionType = {
	Library: "libraries",
	Wishlist: "wishlists",
} as const;
type CollectionType = (typeof CollectionType)[keyof typeof CollectionType];

const baseApiUrl = "http://localhost:3000/api/collections"

const getCollectionList = async (collectionType: CollectionType) => {
	const res = await fetch(baseApiUrl + '/' + collectionType);
	if (!res.ok) {
		throw new Error("Network response was not OK");
	}
	const data = await res.json();
	return data;
}

export {CollectionType, getCollectionList};