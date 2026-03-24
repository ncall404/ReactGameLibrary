// Settings page component and route. Displays app settings and allows the user to change them.

import { createFileRoute } from '@tanstack/react-router'

import Btn from '../components/common/btn.tsx';
import { BtnStyle } from '../components/common/btn.tsx';
import Modal from '../components/common/modal.tsx';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToastContext } from '../components/toast/toastContext.tsx';

import { messageTimeDefaults } from '../utilities.ts';
import type { BackendResponse } from '../types/ServerResponseTypes.ts';

export const Route = createFileRoute('/settings')({
	component: RouteComponent,
})

function RouteComponent() {
	const { setToast } = useToastContext();

	const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

	const resetAppMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch('http://localhost:3000/api/settings/reset-app', {
				method: 'POST',
			});
			if (!res.ok) throw new Error('App reset failed');
			return res.json();
		},
		onSuccess: (data: BackendResponse) => {
			setToast({
				message: data.message,
				type: data.status,
				time: data.time
			});
			if (data.status == "error") {
				console.error(data.message);
			}
		},
		onError: (err) => {
			console.error('Error: ', err);
			setToast({
				message: err.message,
				type: "error",
				time: messageTimeDefaults.error
			});
		},
	});

	return (
		<>
			<section>
				<h1 className="text-3xl pb-2">Settings</h1>

				<article className="my-2 p-2 sm:rounded-sm bg-(--color-darker)">
					<h2 className="text-2xl">Reset App</h2>
					<p className="py-2 text-pretty">Resets the app to it's initial state, removing all: collections, games, metadata, and images.</p>
					<Btn className="w-full sm:w-32" style={BtnStyle.Danger} func={() => {setIsResetConfirmOpen(true)}}>Reset App</Btn>
				</article>

			</section>

			<Modal
			isOpen={isResetConfirmOpen}
			onConfirm={() => {
				resetAppMutation.mutate();
				setIsResetConfirmOpen(false)
			}}
			onClose={() => {setIsResetConfirmOpen(false)}}
			isForm={true}>
				<h2 className="text-2xl">Confirm App Reset</h2>
				<div className="bg-(--color-darker) rounded-sm p-4 mt-2">
					<p>Are you sure you want to reset all app data?</p>
					<p>This removes: collections, games, metadata, and images.</p>
					<br />
					<p><b className="font-bold text-(--color-danger)">This action can NOT be undone!</b></p>
				</div>
				
			</Modal>
		</>
	);
}
