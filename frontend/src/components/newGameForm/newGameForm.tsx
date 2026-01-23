// Work-in-progress NewGameForm component for getting the info needed to add a new GameItem to the database.

import Select from "react-select";
import type { MultiValue, SingleValue } from "react-select";
import type { OptionType } from "../../types/SelectOptionType.ts";
import { fillOptionsArray, fillGroupedOptionsArray, optionsToString } from "../../utilities.ts";

import Btn from "../common/btn.tsx";
import { BtnStyle } from "../common/btn.tsx";
import EditMetadataModal from "../modals/editMetadataModal.tsx";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MetadataField, getMetadata} from "../../api/gameMetadataApi.ts";
import { CollectionType, getCollectionList } from "../../api/collectionsApi.ts";

type NewGameFormProps = {
	onSubmitted: () => void,
	onCancel: () => void,
	collectionType: string, // Change type to object as const with the possible collection types in it.
	collectionId: number,
	formType: "create" | "edit",
	gameID?: number,
}

export default function NewGameForm(props: NewGameFormProps) {
	const queryClient = useQueryClient();

	let api: string = 'http://localhost:3000/api/';
	switch (props.collectionType) {
		case CollectionType.Library: {
			api = api.concat('games/add/library');
			break;
		}
		case CollectionType.Wishlist: {
			api = api.concat('games/add/wishlist');
			break;
		}
	}

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
	const [selectedMediaFormat, setSelectedMediaFormat] = useState<OptionType>();

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

	// Handles correctly submitting the main form's data.
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('gameCollections', optionsToString(selectedCollections));
		formData.append('gameName', gameName);
		formData.append('gameDescription', gameDescription);
		formData.append('releaseDate', releaseDate?.toString());
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

	// useQuery hooks for lists that are used to fill Select inputs.
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
	})


	useEffect(() => {
		if (!collectionList.data) return;

		const matches = fillOptionsArray(collectionList.data).filter(option => option.value === props.collectionId);
		if (matches.length > 0) setSelectedCollections(matches);
	}, [collectionList.data, props.collectionId]);


	return (
		<>
			<form onSubmit={handleSubmit} method="post" className="bg-(--color-darker) rounded-sm p-4 mt-2 accent-(--color-accent) flex flex-col gap-1.5">
				<h2 className="text-2xl">Add Game</h2>
				<hr />

				<label htmlFor="newGameCollections">Collections: </label>
				<Select
					name="gameCollections"
					inputId="newGameCollections"
					className="text-(--color-dark) cursor-pointer"
					closeMenuOnSelect={false}
					isMulti
					required
					value={selectedCollections}
					onChange={(options: MultiValue<OptionType>) => {
						setSelectedCollections(options as OptionType[]);
					}}
					options={collectionList.data}
				/>
				<br />
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
				onDoubleClick={(e) => e.currentTarget.showPicker()}
				required
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
				<br />
				<hr />
				<br />

				<label htmlFor="gameFormMediaFormatOptions">Media Format: </label>
				<Select 
					name="gameMediaFormat"
					inputId="gameFormMediaFormatOptions"
					className="text-(--color-dark) cursor-pointer"
					value={selectedMediaFormat}
					onChange={(option: SingleValue<OptionType>) => {
						setSelectedMediaFormat(option as OptionType);
					}}
					options={mediaFormatList.data}
				/>
				<br />

				<label htmlFor="gameFormGenreOptions">Genre(s): </label>
				<Select
					name="gameGenres"
					inputId="gameFormGenreOptions"
					className="text-(--color-dark) cursor-pointer"
					closeMenuOnSelect={false}
					isMulti
					value={selectedGenres}
					onChange={(options: MultiValue<OptionType>) => {
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
					className="text-(--color-dark) cursor-pointer"
					closeMenuOnSelect={true}
					isMulti
					value={selectedPublishers}
					onChange={(options: MultiValue<OptionType>) => {
						setSelectedPublishers(options as OptionType[]);
					}}
					isLoading={publisherList.isLoading}
					options={publisherList.data}
				/>

				<label htmlFor="gameFormDeveloperOptions">Developer(s): </label>
				<Select
					name="gameDevelopers"
					inputId="gameFormDeveloperOptions"
					className="text-(--color-dark) cursor-pointer"
					closeMenuOnSelect={true}
					isMulti
					value={selectedDevelopers}
					onChange={(options: MultiValue<OptionType>) => {
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
					className="text-(--color-dark) cursor-pointer"
					closeMenuOnSelect={true}
					isMulti
					value={selectedPlatforms}
					onChange={(options: MultiValue<OptionType>) => {
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
					className="text-(--color-dark) cursor-pointer"
					closeMenuOnSelect={true}
					isMulti
					value={selectedStorefronts}
					onChange={(options: MultiValue<OptionType>) => {
						setSelectedStorefronts(options as OptionType[]);
					}}
					options={storefrontList.data}
				/>
				<Btn style={BtnStyle.Neutral} type="button" func={() => {
					setEditMetadataField("storefronts");
					setIsEditModalOpen(true);
				}}>Edit storefront list</Btn>
				<br />
				<hr />

				<div className="flex gap-2 mt-3">
					<Btn style={BtnStyle.Primary} type="submit">Confirm</Btn>
					<Btn style={BtnStyle.Neutral} type="button" func={props.onCancel}>Cancel</Btn>
				</div>
			</form>


			<EditMetadataModal metadataField={editMetadataField} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
			
		</>
	);
}