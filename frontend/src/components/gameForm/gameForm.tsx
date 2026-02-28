// Work-in-progress NewGameForm component for getting the info needed to add a new GameItem to the database.

import Select from "react-select";
import type { OnChangeValue } from "react-select";
import type { OptionType } from "../../types/SelectOptionType.ts";
import { fillOptionsArray, fillGroupedOptionsArray, optionsToString, upperFirstLetter, selectStyles } from "../../utilities.ts";

import Btn from "../common/btn.tsx";
import { BtnStyle } from "../common/btn.tsx";
import EditMetadataModal from "../modals/editMetadataModal.tsx";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MetadataField, getMetadata} from "../../api/gameMetadataApi.ts";
import { CollectionType, getCollectionList } from "../../api/collectionsApi.ts";

type GameFormProps = {
	onSubmitted: () => void,
	onCancel: () => void,
	collectionType: string, // Change type to object as const with the possible collection types in it.
	collectionId: number,
	formType: "create" | "edit",
	gameID?: number,
}

export default function GameForm(props: GameFormProps) {
	const queryClient = useQueryClient();

	const api: string = 'http://localhost:3000/api/games/'.concat(props.formType);


	const gameID = props.gameID ? props.gameID : 0
	// State tracking for non-Select inputs.
	const [gameName, setGameName] = useState<string>('');
	const [gameDescription, setGameDescription] = useState<string>('');
	const [releaseDate, setReleaseDate] = useState<string>('');
	const [coverArt, setCoverArt] = useState<File | null>();
	// State tracking for Select inputs.
	const [selectedCollections, setSelectedCollections] = useState<OptionType[]>([]);
	const [selectedGenres, setSelectedGenres] = useState<OptionType[]>([]);
	const [selectedPlatforms, setSelectedPlatforms] = useState<OptionType[]>([]);
	const [selectedStorefronts, setSelectedStorefronts] = useState<OptionType[]>([]);
	const [selectedPublishers, setSelectedPublishers] = useState<OptionType[]>([]);
	const [selectedDevelopers, setSelectedDevelopers] = useState<OptionType[]>([]);
	const [selectedMediaFormat, setSelectedMediaFormat] = useState<OptionType>({ value: 1, label: "Physical"});

	// State tracking for the cover art image path for when GameForm is in edit mode.
	const [coverArtPath, setCoverArtPath] = useState<string | undefined>();

	// State tracking for the editing modal.
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
	const [editMetadataField, setEditMetadataField] = useState<MetadataField>(MetadataField.Genres);

	// Does the actual API call send the data to the backend.
	const gameMutation = useMutation({
		mutationFn: async (formData: FormData) => {
			const res = await fetch(api, {
				method: 'POST',
				body: formData,
			});
			if (!res.ok) throw new Error('Upload failed');
			return res.json();
		},
		onSuccess: (data) => {
			console.log('Uploaded: ', data);
			invalidateData();
		},
		onError: (err) => console.error('Error: ', err),
	});

	const invalidateData = async () => {
		await queryClient.invalidateQueries({
			queryKey: ['libraries', 'contents', 'single-library', props.collectionId],
			exact: true,
			refetchType: 'all',
		});
	}

	// TODO: Whenever wishlists get added, submit the collection type with the rest of the formData.
	// Handles correctly submitting the main form's data.
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		if (props.formType === "edit" && props.gameID) {
			formData.append('gameID', props.gameID.toString());
		}
		formData.append('gameCollections', optionsToString(selectedCollections));
		formData.append('gameName', gameName);
		formData.append('gameDescription', gameDescription);
		formData.append('releaseDate', releaseDate);
		if (coverArt) {
			formData.append('coverArt', coverArt, coverArt?.name);
		} else {
			formData.append('coverArt', 'None');
		}		
		formData.append('gameGenres', optionsToString(selectedGenres));
		formData.append('gamePlatforms', optionsToString(selectedPlatforms));
		formData.append('gameStorefronts', optionsToString(selectedStorefronts));
		formData.append('gamePublishers', optionsToString(selectedPublishers));
		formData.append('gameDevelopers', optionsToString(selectedDevelopers));
		formData.append('gameMediaFormat', selectedMediaFormat?.value.toString() as string);

		gameMutation.mutate(formData);
		if (props.onSubmitted) props.onSubmitted();
	}

	// useQuery hook for loading data when editing a game entry
	const gameData = useQuery({
		queryKey:['game', gameID],
		queryFn: async () => {
			const res = await fetch(`http://localhost:3000/api/game/${gameID}`);
			if (!res.ok) {
				throw new Error("Network response was not OK");
			}
			const data = await res.json();
			return data;
		}
	});

	// useQuery hooks for lists that are used to fill Select inputs.
	// NOTE: While these could be combined into one or two requests, it was done this way so that less data needs to be refetched when data changes since only one of these is invalidated.
	const collectionList = useQuery({
		queryKey: ['collections' + props.collectionType],
		queryFn: () => getCollectionList(CollectionType.Library),
		select: (data) => fillOptionsArray(data)
	})
	const genreList = useQuery({
		queryKey:['metadata', MetadataField.Genres],
		queryFn: () => getMetadata(MetadataField.Genres),
		select: (data) => fillOptionsArray(data)
	});
	const platformList = useQuery({
		queryKey:['metadata', MetadataField.Platforms],
		queryFn: () => getMetadata(MetadataField.Platforms),
		select: (data) => fillGroupedOptionsArray(data)
	});
	const developerList = useQuery({
		queryKey:['metadata', MetadataField.Companies, MetadataField.Developers],
		queryFn: () => getMetadata(MetadataField.Developers),
		select: (data) => fillOptionsArray(data)
	});
	const publisherList = useQuery({
		queryKey:['metadata', MetadataField.Companies, MetadataField.Publishers],
		queryFn: () => getMetadata(MetadataField.Publishers),
		select: (data) => fillOptionsArray(data)
	});
	const storefrontList = useQuery({
		queryKey:['metadata', MetadataField.Storefronts],
		queryFn: () => getMetadata(MetadataField.Storefronts),
		select: (data) => fillOptionsArray(data)
	});
	const mediaFormatList = useQuery({
		queryKey:['metadata', MetadataField.MediaFormat],
		queryFn: () => getMetadata(MetadataField.MediaFormat),
		select: (data) => fillOptionsArray(data)
	});


	useEffect(() => {
		if (!collectionList.data) return;

		const matches = fillOptionsArray(collectionList.data).filter(option => option.value === props.collectionId);
		if (matches.length > 0) setSelectedCollections(matches);
	}, [collectionList.data, props.collectionId]);

	useEffect(() => {
		if (!mediaFormatList.data) return;

		setSelectedMediaFormat(mediaFormatList.data[0]);
	}, [mediaFormatList.data]);

	useEffect(() => {
		if (gameID > 0 && props.formType == "edit") {
			if (!gameData.data) return;

			parseGameData(gameData.data);
		}
	}, [gameData.data, gameID, props.formType]);


	const parseGameData = function parseGameData(data: 
		{
			gameData: {
				Title: string,
				Description: string,
				ReleaseDate: string,
				CoverArt: string,
				MediaFormatID: number,
				MediaFormatTitle: string,
			}
			libraryData: {
				LibraryID: number,
				Title: string,
			}[],
			publisherData: {
				CompanyID: number,
				Title: string,
			}[],
			developerData: {
				CompanyID: number,
				Title: string,
			}[],
			genreData: {
				GenreID: number,
				Title: string,
			}[],
			platformData: {
				PlatformID: number,
				Title: string,
			}[],
			storefrontData: {
				StorefrontID: number,
				Title: string,
			}[],
		}
	) {
		setSelectedCollections(data.libraryData.map((value: {LibraryID: number, Title: string}) => {
			return {value: value.LibraryID, label: value.Title};
		}));

		const gameFormName = document.getElementById("gameFormName") as HTMLInputElement;
		if (gameFormName) {
			gameFormName.value = data.gameData.Title;
			setGameName(data.gameData.Title);
		}
		const gameFormDescription = document.getElementById("gameFormDescription") as HTMLTextAreaElement;
		if (gameFormDescription) {
			gameFormDescription.value = data.gameData.Description;
			setGameDescription(data.gameData.Description);
		}
		const gameFormReleaseDate = document.getElementById("gameFormReleaseDate") as HTMLInputElement;
		if (gameFormReleaseDate) {
			gameFormReleaseDate.valueAsNumber = parseInt(data.gameData.ReleaseDate) * 1000; // Converts unix time value from seconds to milliseconds for JavaScript
			setReleaseDate(gameFormReleaseDate.value);
		}
		setSelectedMediaFormat({value: data.gameData.MediaFormatID, label: data.gameData.MediaFormatTitle});

		setCoverArtPath("http://localhost:3000/".concat(data.gameData.CoverArt));

		setSelectedGenres(data.genreData.map((value: {GenreID: number, Title: string}) => {
			return {value: value.GenreID, label: value.Title};
		}));
		setSelectedPublishers(data.publisherData.map((value: {CompanyID: number, Title: string}) => {
			return {value: value.CompanyID, label: value.Title};
		}));
		setSelectedDevelopers(data.developerData.map((value: {CompanyID: number, Title: string}) => {
			return {value: value.CompanyID, label: value.Title};
		}));
		setSelectedPlatforms(data.platformData.map((value: {PlatformID: number, Title: string}) => {
			return {value: value.PlatformID, label: value.Title};
		}));
		setSelectedStorefronts(data.storefrontData.map((value: {StorefrontID: number, Title: string}) => {
			return {value: value.StorefrontID, label: value.Title};
		}));
	}


	return (
		<>
			<form onSubmit={handleSubmit} method="post" id="gameForm" className="bg-(--color-darker) rounded-sm p-4 mt-2 accent-(--color-accent) flex flex-col gap-1.5">
				<div className="flex max-sm:flex-col gap-2 sm:items-center">
					<h2 className="text-2xl max-sm:order-2 grow">{upperFirstLetter(props.formType)} Game</h2>
					<Btn className="basis-32 justify-self-end max-sm:basis-full max-sm:order-1" style={BtnStyle.Neutral} type="button" func={props.onCancel}>Cancel</Btn>
				</div>
				<hr />

				<label htmlFor="newGameCollections">Collections: </label>
				<Select
					name="gameCollections"
					inputId="newGameCollections"
					styles={selectStyles}
					closeMenuOnSelect={false}
					isMulti
					value={selectedCollections}
					onChange={(options: OnChangeValue<OptionType, boolean>) => {
						setSelectedCollections(options as OptionType[]);
					}}
					options={collectionList.data}
				/>

				<hr />

				<label htmlFor="gameFormName">Name: </label>
				<input type="text"
				name="gameName"
				id="gameFormName"
				placeholder="Name of the game"
				required
				onChange={(e) => {
					setGameName(e.currentTarget.value);
				}} />

				<label htmlFor="gameFormDescription">Description: </label>
				<textarea
				name="description"
				id="gameFormDescription"
				placeholder="Description of the game"
				onChange={(e) => {
					setGameDescription(e.currentTarget.value);
				}}
				></textarea>

				<label htmlFor="gameFormReleaseDate">Release Date: </label>
				<input type="date"
				name="releaseDate"
				id="gameFormReleaseDate"
				className="max-md:w-full w-40"
				onDoubleClick={(e) => e.currentTarget.showPicker()}
				onChange={(e) => {
					setReleaseDate(e.currentTarget.value);
				}}/>

				<label htmlFor="gameFormCoverArt">Cover Art: </label>
				<input type="file"
				name="coverArt"
				id="gameFormCoverArt"
				accept="image/*"
				onChange={(e) => {
					if (e.currentTarget.files) {
						setCoverArt(e.currentTarget.files[0]);
					} else {
						setCoverArt(null);
					}
				}}/>
				{
					// Display the currently stored image if the form is in edit mode.
					props.formType == "edit" &&
					<figure>
						<img className="motion-safe:transition-all ease-in-out h-64 w-fit"
				 		src={coverArtPath}
						alt="Currently used image for the game being edited" />
						<figcaption>Currently used image for this game.</figcaption>
					</figure>
				}

				

				<label htmlFor="gameFormMediaFormatOptions">Media Format: </label>
				<Select 
					name="gameMediaFormat"
					inputId="gameFormMediaFormatOptions"
					styles={selectStyles}
					value={selectedMediaFormat}
					required
					onChange={(option: OnChangeValue<OptionType, boolean>) => {
						setSelectedMediaFormat(option as OptionType);
					}}
					options={mediaFormatList.data}
					hideSelectedOptions
				/>

				<hr />

				<label htmlFor="gameFormGenreOptions">Genre(s): </label>
				<Select
					name="gameGenres"
					inputId="gameFormGenreOptions"
					styles={selectStyles}
					closeMenuOnSelect={false}
					isMulti
					value={selectedGenres}
					onChange={(options: OnChangeValue<OptionType, boolean>) => {
						setSelectedGenres(options as OptionType[]);
					}}
					options={genreList.data}
				/>
				<Btn style={BtnStyle.Neutral} type="button" func={() => {
					setEditMetadataField(MetadataField.Genres);
					setIsEditModalOpen(true);
				}}>Edit genre list</Btn>
				<br />

				<label htmlFor="gameFormPublisherOptions">Publisher(s): </label>
				<Select
					name="gamePublishers"
					inputId="gameFormPublisherOptions"
					styles={selectStyles}
					closeMenuOnSelect={true}
					isMulti
					value={selectedPublishers}
					onChange={(options: OnChangeValue<OptionType, boolean>) => {
						setSelectedPublishers(options as OptionType[]);
					}}
					isLoading={publisherList.isLoading}
					options={publisherList.data}
				/>

				<label htmlFor="gameFormDeveloperOptions">Developer(s): </label>
				<Select
					name="gameDevelopers"
					inputId="gameFormDeveloperOptions"
					styles={selectStyles}
					closeMenuOnSelect={true}
					isMulti
					value={selectedDevelopers}
					onChange={(options: OnChangeValue<OptionType, boolean>) => {
						setSelectedDevelopers(options as OptionType[]);
					}}
					options={developerList.data}
				/>
				<Btn style={BtnStyle.Neutral} type="button" func={() => {
					setEditMetadataField("companies");
					setIsEditModalOpen(true);
				}}>Edit company list</Btn>
				<br />

				<label htmlFor="gameFormPlatformOptions">Platform(s): </label>
				<Select
					name="gamePlatforms"
					inputId="gameFormPlatformOptions"
					styles={selectStyles}
					closeMenuOnSelect={true}
					isMulti
					value={selectedPlatforms}
					onChange={(options: OnChangeValue<OptionType, boolean>) => {
						setSelectedPlatforms(options as OptionType[]);
					}}
					options={platformList.data}
				/>
				<Btn style={BtnStyle.Neutral} type="button" func={() => {
					setEditMetadataField("platforms");
					setIsEditModalOpen(true);
				}}>Edit platform list</Btn>
				<br />

				<label htmlFor="gameFormStorefrontOptions">Storefront(s): </label>
				<Select
					name="gameStorefronts"
					inputId="gameFormStorefrontOptions"
					styles={selectStyles}
					closeMenuOnSelect={true}
					isMulti
					value={selectedStorefronts}
					onChange={(options: OnChangeValue<OptionType, boolean>) => {
						setSelectedStorefronts(options as OptionType[]);
					}}
					options={storefrontList.data}
				/>
				<Btn style={BtnStyle.Neutral} type="button" func={() => {
					setEditMetadataField("storefronts");
					setIsEditModalOpen(true);
				}}>Edit storefront list</Btn>

				<hr />

				<div className="flex max-sm:flex-col gap-2 mt-3">
					<Btn className="basis-32 max-sm:basis-full" style={BtnStyle.Primary} type="submit">Confirm</Btn>
					<Btn className="basis-32 max-sm:basis-full" style={BtnStyle.Neutral} type="button" func={props.onCancel}>Cancel</Btn>
				</div>
			</form>


			<EditMetadataModal metadataField={editMetadataField} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
			
		</>
	);
}