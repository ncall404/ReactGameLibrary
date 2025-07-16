// Library page component and route. Displays selected library of games.

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import GameItem from '../components/gameItem/gameItem.tsx';
import type { GameObject } from "../interfaces/gameObjectInterface.ts";
import { getSingleLibrary } from '../api/libraryApi.ts';


export const Route = createFileRoute('/')({
	component: RouteComponent,
});


function RouteComponent() {
	// TODO: Change so that multiple queries can be made on this page.
	const { status, data, error } = useQuery({
		queryKey:['http://localhost:3000/api/libraries', 1],
		queryFn: () => getSingleLibrary(1),
	});

	if (status === 'pending') {
		return <p className='text-(--color-accent)'>Loading...</p>
	}

	if (status === 'error') {
		return <p className='text-red-500'>Error: {error.message}</p>
	}

	return (
		<section>
			<h1 className='text-3xl'>Game Library</h1>
			<>
				{data && data?.map((game: GameObject) => <GameItem key={game.GameID} data={game}/>)}
			</>
		</section>
	);
}
