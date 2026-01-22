// Library page component and route. Displays selected library of games.

import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import Btn from '../components/common/btn.tsx';
import { BtnStyle } from '../components/common/btn.tsx';

import GameItem from '../components/gameItem/gameItem.tsx';
import type { GameObject } from "../interfaces/gameObjectInterface.ts";

import NewGameForm from '../components/newGameForm/newGameForm.tsx';
import EditCollectionsModal from '../components/modals/editCollectionsModal.tsx';

import Select from "react-select";
import type { SingleValue } from "react-select";
import type { OptionType } from "../types/SelectOptionType.ts";
import { fillOptionsArray } from '../utilities.ts';

import { getSingleLibrary } from '../api/libraryApi.ts';
import { CollectionType, getCollectionList } from '../api/collectionsApi.ts';


export const Route = createFileRoute('/')({
	component: RouteComponent,
});


function RouteComponent() {
	const [gameFormIsOpen, setGameFormIsOpen] = useState(false);
	const [editCollectionsIsOpen, setEditCollectionsIsOpen] = useState(false);
	const [selectedCollection, setSelectedCollection] = useState<OptionType>({ value: 0, label: "None"});

	const queryClient = useQueryClient();

	// For retrieving a list of the stored libraries. Formats to work in a Select input.
	const libraryList = useQuery({
		queryKey:['collections', 'library-list'],
		queryFn: () => getCollectionList(CollectionType.Library),
		select: (data) => {
			const libraryOptions = fillOptionsArray(data);
			// Add "None" option to returned array of libraries and return the new array of libraries.
			libraryOptions.unshift({
				value: 0,
				label: "None"
			});
			return libraryOptions;
		}
	});

	useEffect(() => {
		if (!libraryList.data) return;

		if (libraryList.data.length > 1) {
			setSelectedCollection(libraryList.data[1]);
		} else {
			setSelectedCollection(libraryList.data[0]);
		}
	}, [libraryList.data]);

	// For retrieving the contents of a single library.
	const singleLibrary = useQuery({
		queryKey:['libraries', 'contents', 'single-library', selectedCollection.value],
		queryFn: () => getSingleLibrary(selectedCollection.value),
	});

	if (singleLibrary.status === 'pending') {
		return <p className='text-(--color-accent)'>Loading games...</p>
	}

	if (singleLibrary.status === 'error') {
		return <p className='text-red-500'>Error: {singleLibrary.error.message}</p>
	}

	return (
		<section>
			<h1 className='text-3xl pb-2'>Game Library</h1>
			{ !gameFormIsOpen &&
			<>
				<div className='flex gap-2 max-sm:flex-col'>
					<Select
						name="selectedCollection"
						inputId="selectedCollection"
						className="text-(--color-dark) cursor-pointer sm:min-w-3xs"
						value={selectedCollection}
						onChange={(option: SingleValue<OptionType>) => {
							setSelectedCollection(option as OptionType);
							queryClient.invalidateQueries({queryKey: ['single-library', selectedCollection.value]})
						}}
						options={libraryList.data}
						hideSelectedOptions
						noOptionsMessage={() => "No collections found."}
					/>
					<Btn style={BtnStyle.Primary} func={() => setEditCollectionsIsOpen(true)}>Edit Collections</Btn>
					<Btn style={BtnStyle.Primary} func={() => setGameFormIsOpen(true)}>New Game</Btn>
				</div>

				<EditCollectionsModal isOpen={editCollectionsIsOpen} onClose={() => setEditCollectionsIsOpen(false)} />
				{singleLibrary.data && singleLibrary.data?.map((game: GameObject) => <GameItem key={game.GameID} data={game}/>)}
			</>
			}
			{
				gameFormIsOpen &&
				<NewGameForm 
				onSubmitted={() => {
					setGameFormIsOpen(false);
					queryClient.invalidateQueries({queryKey: ['libraries']}); // Refetch libraries query.
				}} 
				onCancel={() => setGameFormIsOpen(false)} 
				collectionType={CollectionType.Library} collectionId={selectedCollection.value}
				/>
			}
		</section>
	);
}
