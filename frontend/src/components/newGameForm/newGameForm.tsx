// Work-in-progress NewGameForm component for getting the info needed to add a new GameItem to the database.

import Select from "react-select";
import type { MultiValue, SingleValue } from "react-select";
import Btn from "../common/btn.tsx";
import { BtnStyle } from "../common/btn.tsx";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getGenres, getPlatforms } from "../../api/gameMetadataApi.ts";

// Type for the Select component data to use.
type OptionType = {
	value: number; // ID related to the displayed label.
	label: string;
}
// Type for the Select component to be able to group items.
type GroupedOption = {
	label: string; // Grouping label.
	options: OptionType[];
}

type NewGameFormProps = {
	onSubmitted?: () => void,
	onCancel?: () => void,
	collectionType: string, // Change type to object as const with the possible collection types in it.
	collectionId: number,
}

export default function NewGameForm(props: NewGameFormProps) {
	const [selectedGenres, setSelectedGenres] = useState<OptionType[]>([]);
	const [selectedPlatforms, setSelectedPlatforms] = useState<OptionType[]>([]);
	const [selectedStorefronts, setSelectedStorefronts] = useState<OptionType[]>([]);
	const [selectedPublisher, setSelectedPublisher] = useState<OptionType>();
	const [selectedDeveloper, setSelectedDeveloper] = useState<OptionType>();

	const genreList = useQuery({
		queryKey:['http://localhost:3000/api/metadata/genres'],
		queryFn: () => getGenres(),
	});

	const platformList = useQuery({
		queryKey:['http://localhost:3000/api/metadata/platforms'],
		queryFn: () => getPlatforms(),
	});

	let api: string = 'https://localhost:3000/api/';
	switch (props.collectionType) {
		case 'library': {
			api = api.concat('libraries/addGame');
			break;
		}
		case 'wishlist': {
			api = api.concat('wishlists/addGame');
			break;
		}
	}

	// Functions to fill the options for the react-select inputs
	const fillGenres = (): OptionType[] => {
		if (!genreList.data) return [];

		const genres: OptionType[] = [];
		if (genreList.data) {
			genreList.data?.map((genre: {GenreID: number, Title: string}) => {
				genres.push({value: genre.GenreID, label: genre.Title});
			});
		}
		return genres;
	}
	const fillPlatforms = (): GroupedOption[] => {
		if (!platformList.data) return [];

		const grouped = new Map<string, OptionType[]>();

		platformList.data.forEach((platform: {PlatformID: number, PlatformTitle: string, CompanyTitle: string}) => {
			const company = platform.CompanyTitle;
			const option: OptionType = {value: platform.PlatformID, label: platform.PlatformTitle}

			if (!grouped.has(company)) {
				grouped.set(company, []);
			}
			grouped.get(company)!.push(option);
		});

		return Array.from(grouped.entries()).map(([label, options]) => ({label, options}));
	}

	// TODO: Allow the user to select a previously uploaded images for game cover art.
	return (
		<form action={api} method="post" className="bg-(--color-darker) rounded-sm p-4 mt-2 accent-(--color-accent) flex flex-col gap-1.5">
			<input type="hidden" name="collectionId" value={props.collectionId} />

			<h2 className="text-2xl">Add Game to {props.collectionType.charAt(0).toUpperCase() + props.collectionType.slice(1)}</h2>
			<hr />

			<label htmlFor="newGameName">Name: </label>
			<input type="text" name="gameName" id="newGameName" placeholder="Name of the game" required />

			<label htmlFor="newGameDescription">Description: </label>
			<textarea name="description" id="newGameDescription" placeholder="Description of the game"></textarea>

			<label htmlFor="newGameReleaseDate">Release Date: </label>
			<input type="date" name="releaseDate" id="newGameReleaseDate" onDoubleClick={(e) => e.currentTarget.showPicker()} required />

			<label htmlFor="newGameCoverArt">Cover Art: </label>
			<input type="file" name="coverArt" id="newGameCoverArt" accept="image/*"/>
			<br />
			<hr />
			<br />

			<label htmlFor="newGameGenreOptions">Genres: </label>
			<Select
				name="gameGenres"
				inputId="newGameGenreOptions"
				className="text-(--color-dark) cursor-pointer"
				isMulti
				value={selectedGenres}
				onChange={(options: MultiValue<OptionType>) => {
					setSelectedGenres(options as OptionType[]);
				}}
				options={fillGenres()}
			/>
			<Btn style={BtnStyle.Neutral} func={() => {}}>Edit genre list</Btn>
			<br />

			<label htmlFor="newGamePublisherOptions">Publisher: </label>
			<Select
				name="gamePublishers"
				inputId="newGamePublisherOptions"
				className="text-(--color-dark) cursor-pointer"
				value={selectedPublisher}
				onChange={(option: SingleValue<OptionType>) => {
					setSelectedPublisher(option as OptionType);
				}}
			/>

			<label htmlFor="newGameDeveloperOptions">Developer: </label>
			<Select
				name="gameDevelopers"
				inputId="newGameDeveloperOptions"
				className="text-(--color-dark) cursor-pointer"
				value={selectedDeveloper}
				onChange={(option: SingleValue<OptionType>) => {
					setSelectedDeveloper(option as OptionType);
				}}
			/>
			<Btn style={BtnStyle.Neutral} func={() => {}}>Edit company list</Btn>
			<br />

			<label htmlFor="newGamePlatformOptions">Platforms: </label>
			<Select
				name="gamePlatforms"
				inputId="newGamePlatformOptions"
				className="text-(--color-dark) cursor-pointer" 
				isMulti
				value={selectedPlatforms}
				onChange={(options: MultiValue<OptionType>) => {
					setSelectedPlatforms(options as OptionType[]);
				}}
				options={fillPlatforms()}
			/>
			<Btn style={BtnStyle.Neutral} func={() => {}}>Edit platform list</Btn>
			<br />

			{/* TODO: Group storefronts by platform */}
			<label htmlFor="newGameStorefrontOptions">Storefronts: </label>
			<Select
				name="gameStorefronts"
				inputId="newGameStorefrontOptions"
				className="text-(--color-dark) cursor-pointer"
				isMulti
				value={selectedStorefronts}
				onChange={(options: MultiValue<OptionType>) => {
					setSelectedStorefronts(options as OptionType[]);
				}}
			/>
			<Btn style={BtnStyle.Neutral} func={() => {}}>Edit storefront list</Btn>
			<br />
			<hr />

			<div className="flex gap-2 mt-3">
				<Btn style={BtnStyle.Primary} func={props.onSubmitted} type="submit">Create Game</Btn>
				<Btn style={BtnStyle.Neutral} func={props.onCancel}>Cancel</Btn>
			</div>
		</form>
	);
}