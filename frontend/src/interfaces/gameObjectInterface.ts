// 

export interface GameObject {
	GameID: number,
	Title: string,
	Description: string | null,
	ReleaseDate: number, // TODO: may need to change this to a different data type depending on how you return it from the database (currently UNIX time is returned as that's how it is stored)
	CoverArt: string,
	PublisherName: string | null,
	DeveloperName: string | null,
	Genres: [string] | null,
}