// Modal component for editing game collections. Currently that means adding and removing library collections from the database.

import Select from "react-select";
import type { OnChangeValue } from "react-select";
import type { OptionType } from "../../types/SelectOptionType.ts";
import { fillOptionsArray, optionsToString, selectStyles, messageTimeDefaults, type BackendResponse } from "../../utilities.ts";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import Modal from "../common/modal.tsx";
import Btn from "../common/btn.tsx";
import { BtnStyle } from "../common/btn.tsx";

import { CollectionType, getCollectionList, addCollection, removeCollection } from '../../api/collectionsApi.ts';
import { useToastContext } from "../toast/toastContext.tsx";

type EditCollectionsModalProps = {
	isOpen: boolean;
	onClose: () => void;
}

export default function EditCollectionsModal(props: EditCollectionsModalProps) {
	const queryClient = useQueryClient();
	const { setToast } = useToastContext();

	// State(s) for add form.
	const [editCollectionAdd, setEditCollectionAdd] = useState<string>("");
	// State(s) for remove form.
	const [selectedForRemoval, setSelectedForRemoval] = useState<OptionType[]>([]);
	// State of delete confirmation modal.
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);

	// Mutation for adding a library.
	const editCollectionAddMutation = useMutation({
		mutationFn: addCollection,
		onSuccess: async (data: BackendResponse) => {
			setToast({
				message: data.message,
				type: data.status,
				time: data.time,
			});
			if (data.status == "error") {
				console.error(data.message);
			}
			setEditCollectionAdd("");

			// Invalidate data that changed.
			await invalidateData();
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

	// Mutation for removing libraries.
	const editCollectionRemoveMutation = useMutation({
		mutationFn: removeCollection,
		onSuccess: async (data: BackendResponse) => {
			setToast({
				message: data.message,
				type: data.status,
				time: data.time,
			});
			if (data.status == "error") {
				console.error(data.message);
			}
			setSelectedForRemoval([]);

			// Invalidate data that changed.
			await invalidateData();
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

	const invalidateData = async () => {
		await queryClient.invalidateQueries({
			queryKey: ['collections', 'library-list'],
			exact: false,
			refetchType: 'all',
		});
	}


	// Query to fill the list of libraries for removal options.
	const libraryList = useQuery({
		queryKey:['collections', 'library-list'],
		queryFn: () => getCollectionList(CollectionType.Library),
		select: (data) => fillOptionsArray(data)
	});


	// Form Handlers
	const handleEditListAdd = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('collectionType', "library");
		formData.append('collectionAddTitle', editCollectionAdd);
		editCollectionAddMutation.mutate(formData);
	}

	const handleEditListRemove = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('collectionType', "library");
		formData.append('collectionRemove', optionsToString(selectedForRemoval));
		editCollectionRemoveMutation.mutate(formData);

		setIsDeleteConfirmOpen(true);
	}


	return (
		<Modal isOpen={props.isOpen} onClose={props.onClose}>
			<h2 className="text-2xl">Collections</h2>
			<form onSubmit={handleEditListAdd} method="post" className="modal-section flex flex-col gap-1.5">
				<h3 className="text-xl">Add</h3>
				<label htmlFor="editCollectionAdd">Name: </label>
				<input type="text"
				name="collectionAddTitle"
				id="editCollectionAdd"
				placeholder="Name of collection..."
				value={editCollectionAdd}
				required
				onChange={(e) => {
					setEditCollectionAdd(e.currentTarget.value);
				}}
				/>
				<Btn type="submit" style={BtnStyle.Primary}>Add Collection</Btn>
			</form>

			<form onSubmit={handleEditListRemove} method="post" id="removeCollectionForm" className="modal-section accent-(--color-accent) flex flex-col gap-1.5">
				<h3 className="text-xl">Remove</h3>
				<label htmlFor="collectionRemove">Collections to remove: </label>
				<Select
					name="collectionRemove"
					inputId="collectionRemove"
					styles={selectStyles}
					isMulti
					value={selectedForRemoval}
					onChange={(options: OnChangeValue<OptionType, boolean>) => {
						setSelectedForRemoval(options as OptionType[]);
					}}
					options={libraryList.data}
					noOptionsMessage={() => "No collections found."}
				/>
				<Btn type="button" style={BtnStyle.Danger} func={() => setIsDeleteConfirmOpen(true)}>Remove Selected</Btn>

				<Modal
				isOpen={isDeleteConfirmOpen}
				onConfirm={() => {
					const form: HTMLFormElement = document.getElementById("removeCollectionForm") as HTMLFormElement;
					form.requestSubmit(); // Emulate the user clicking a submit button on modal confirmation.
					
					setIsDeleteConfirmOpen(false);
				}}
				onClose={() => {setIsDeleteConfirmOpen(false)}}
				isForm={true}>
					<h2 className="text-2xl">Confirm Collection Removal?</h2>
					<div className="modal-section">
						<p>Are you sure you want to remove the selected collection(s)?</p>
						<p>If there are games exclusively in this collection, you will be able to view them by selecting the "None" collection.</p>
						<br />
						<p><b className="font-bold text-(--color-danger)">This action can NOT be undone!</b></p>
					</div>
				</Modal>
			</form>
		</Modal>
	);
}