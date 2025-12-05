// Settings page component and route. Displays app settings and allows the user to change them.

import { createFileRoute } from '@tanstack/react-router'

import Btn from '../components/common/btn.tsx';
import { BtnStyle } from '../components/common/btn.tsx';
import Modal from '../components/common/modal.tsx';

import { useState } from 'react';

export const Route = createFileRoute('/settings')({
	component: RouteComponent,
})

function RouteComponent() {
	const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

	return (
		<>
			<section>
				<h1 className='text-3xl pb-2'>Settings</h1>

				<article className="my-3 p-4 bg-(--color-darker)">
					<h2 className='text-2xl'>Reset App</h2>
					<p className='py-2 text-pretty'>Resets the app to it's initial state, removing all: collections, games, metadata, and images.</p>
					<Btn style={BtnStyle.Danger} func={() => {setIsResetConfirmOpen(true)}}>Reset App</Btn>
				</article>

			</section>

			<Modal isOpen={isResetConfirmOpen}
			onConfirm={() => {setIsResetConfirmOpen(false)}}
			onClose={() => {setIsResetConfirmOpen(false)}}
			isForm={true}>
				<h2 className="text-2xl pb-2">Confirm App Reset</h2>
				<p>Are you sure you want to reset all app data? This action can not be undone</p>
				<p>This removes: collections, games, metadata, and images.</p>
			</Modal>
		</>
	);
}
