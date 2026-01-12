// Library page component and route. Displays selected library of games.

import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import Btn from '../components/common/btn.tsx';
import { BtnStyle } from '../components/common/btn.tsx';

import GameItem from '../components/gameItem/gameItem.tsx';
import type { GameObject } from "../interfaces/gameObjectInterface.ts";

import NewGameForm from '../components/newGameForm/newGameForm.tsx';

import { getSingleLibrary } from '../api/libraryApi.ts';
import { CollectionType } from '../api/collectionsApi.ts';


export const Route = createFileRoute('/')({
	component: RouteComponent,
});


function RouteComponent() {
	const [newGameIsOpen, setNewGameIsOpen] = useState(false);

	const queryClient = useQueryClient();

	const singleLibrary = useQuery({
		queryKey:['libraries', 'contents', 'single-library'],
		queryFn: () => getSingleLibrary(1),
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
			{ !newGameIsOpen &&
			<>
				<div className='flex gap-2 max-sm:flex-col'>
					<Btn style={BtnStyle.Primary} func={() => setEditCollectionsIsOpen(true)}>Edit Collections</Btn>
<Btn style={BtnStyle.Primary} func={() => setNewGameIsOpen(true)}>New Game</Btn>
				</div>

				<EditCollectionsModal isOpen={editCollectionsIsOpen} onClose={() => setEditCollectionsIsOpen(false)} />
				{singleLibrary.data && singleLibrary.data?.map((game: GameObject) => <GameItem key={game.GameID} data={game}/>)}
			</>
			}
			{
				newGameIsOpen &&
				<NewGameForm 
				onSubmitted={() => {
					setNewGameIsOpen(false);
					queryClient.invalidateQueries({queryKey: ['libraries']}); // Refetch libraries query.
				}} 
				onCancel={() => setNewGameIsOpen(false)} 
				collectionType={CollectionType.Library} collectionId={1}
				/>
			}
		</section>
	);
}
