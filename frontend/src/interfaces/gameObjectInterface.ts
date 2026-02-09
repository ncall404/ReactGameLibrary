// 

export interface GameObject {
	GameID: number,
	Title: string,
	Description: string | null,
	ReleaseDate: number,
	CoverArt: string,
	Platforms: string | null,
	Storefronts: string | null,
	Publishers: string | null,
	Developers: string | null,
	Genres: string | null,
}