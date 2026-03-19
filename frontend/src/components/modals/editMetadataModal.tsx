// Modal component for editing game metadata such as companies, genres, platforms.

import Modal from "../common/modal.tsx";
import Btn from "../common/btn.tsx";
import { BtnStyle } from "../common/btn.tsx";

import Select from "react-select";
import type { OnChangeValue } from "react-select";
import type { OptionType } from "../../types/SelectOptionType.ts";
import { fillGroupedOptionsArray, fillOptionsArray, optionsToString, upperFirstLetter, selectStyles, messageTimeDefaults, type BackendResponse } from "../../utilities.ts";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getMetadata, MetadataField } from "../../api/gameMetadataApi.ts";
import { useToastContext } from "../toast/toastContext.tsx";

type EditMetadataModalProps = {
	metadataField: MetadataField;
	isOpen: boolean;
	onClose: () => void;
}

export default function EditMetadataModal(props: EditMetadataModalProps) {
	const queryClient = useQueryClient();
	const { setToast } = useToastContext();

	const editMetadataField = props.metadataField;
	const baseApi: string = 'http://localhost:3000/api/metadata/';
	const api = baseApi.concat(editMetadataField);

	// States for add form.
	const [editMetadataAdd, setEditMetadataAdd] = useState<string>("");
	const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<OptionType[]>([]);
	const [selectedPlatformOwner, setSelectedPlatformOwner] = useState<OptionType>();
	const [storefrontWebsite, setStorefrontWebsite] = useState<string>("");
	// States for remove form.
	const [selectedForRemoval, setSelectedForRemoval] = useState<OptionType[]>([]);
	// State of delete confirmation modal.
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);

	// Mutation for adding metadata.
	const editMetadataAddMutation = useMutation({
		mutationFn: async(formData: FormData) => {
			const res = await fetch(api.concat("/add"), {
				method: 'POST',
				body: formData,
			});
			if (!res.ok) throw new Error('Failed to add to ' + props.metadataField);
			return res.json();
		},
		onSuccess: async (data: BackendResponse) => {
			setToast({
				message: data.message,
				type: data.status,
				time: data.time,
			});
			if (data.status == "error") {
				console.error(data.message);
			}
			// Clear state for inputs.
			switch (editMetadataField) {
				case MetadataField.Companies:
					setSelectedCompanyTypes([]);
					break;
				case MetadataField.Platforms:
					setSelectedPlatformOwner(undefined);
					break;
				case MetadataField.Storefronts:
					setStorefrontWebsite("");
			}
			setEditMetadataAdd("");

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
	// Mutation for removing metadata.
	const editMetadataRemoveMutation = useMutation({
		mutationFn: async(formData: FormData) => {
			const res = await fetch(api.concat("/remove"), {
				method: 'POST',
				body: formData,
			});
			if (!res.ok) throw new Error('Failed to remove from ' + props.metadataField);
			return res.json();
		},
		onSuccess: async (data: BackendResponse) => {
			setToast({
				message: data.message,
				type: data.status,
				time: data.time,
			});
			if (data.status == "error") {
				console.error(data.message);
			}
			// Clear state for inputs.
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
			queryKey: ['metadata', editMetadataField],
			exact: false,
			refetchType: 'all',
		});
	}


	// Clear inputs if the modal is closed.
	if (!props.isOpen) {
		if (selectedForRemoval.length > 0) {
			setSelectedForRemoval([]);
		}
		if (editMetadataAdd.length > 0) {
			setEditMetadataAdd("");
		}
		if (selectedCompanyTypes.length > 0) {
			setSelectedCompanyTypes([]);
		}
		if (selectedPlatformOwner?.value !== undefined) {
			setSelectedPlatformOwner(undefined);
		}
		if (storefrontWebsite.length > 0) {
			setStorefrontWebsite("");
		}
	}

	// Queries to fill the select components.
	const removeList = useQuery({
		queryKey: editMetadataField == MetadataField.Companies ? ['metadata', editMetadataField, 'all-companies'] : ['metadata', editMetadataField],
		queryFn: () => getMetadata(editMetadataField),
		select: (data) => {
			if (editMetadataField == MetadataField.Platforms) {
				return fillGroupedOptionsArray(data);
			} else {
				return fillOptionsArray(data);
			}
		}
	});

	const companyTypesList = useQuery({
		queryKey: ['metadata', 'company-types'],
		queryFn: () => getMetadata(MetadataField.CompanyType),
		select: (data) => fillOptionsArray(data)
	})

	const platformOwnersList = useQuery({
		queryKey: ['metadata', 'platform-owners'],
		queryFn: () => getMetadata(MetadataField.PlatformOwners),
		select: (data) => fillOptionsArray(data)
	});


	// Form Handlers
	const handleEditListAdd = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('metadataType', editMetadataField);
		formData.append('metadataAddTitle', editMetadataAdd);
		switch (editMetadataField) {
			case MetadataField.Companies:
				formData.append('companyTypes', optionsToString(selectedCompanyTypes));
				break;
			case MetadataField.Storefronts:
				formData.append('storefrontWebsite', storefrontWebsite);
				break;
			case MetadataField.Platforms:
				formData.append('platformOwner', selectedPlatformOwner?.value.toString() as string);
		}
		editMetadataAddMutation.mutate(formData);
	}

	const handleEditListRemove = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('editMetadataRemove', optionsToString(selectedForRemoval));
		editMetadataRemoveMutation.mutate(formData);

		setIsDeleteConfirmOpen(true);
	}


	return (
		<Modal isOpen={props.isOpen} onClose={props.onClose}>
			<h2 className="text-2xl">{upperFirstLetter(editMetadataField)}</h2>
			<form onSubmit={handleEditListAdd} method="post" className="modal-section accent-(--color-accent) flex flex-col gap-1.5">
				<h3 className="text-xl">Add</h3>
				<label htmlFor="editMetadataAdd">Name: </label>
				<input type="text"
				name="metaDataAddTitle"
				id="editMetadataAdd"
				placeholder="Option to add..."
				value={editMetadataAdd}
				required
				onChange={(e) => {
					setEditMetadataAdd(e.currentTarget.value);
				}}
				/>

				{ // Company type selection
					editMetadataField == "companies" ?
					<>
						<label htmlFor="editMetadataCompanyTypes">Company type(s): </label>
						<Select
							name="companyTypes"
							inputId="editMetadataCompanyTypes"
							styles={selectStyles}
							closeMenuOnSelect={false}
							isMulti
							value={selectedCompanyTypes}
							onChange={(options: OnChangeValue<OptionType, boolean>) => {
								setSelectedCompanyTypes(options as OptionType[]);
							}}
							options={companyTypesList.data}
							required
						/>
					</> :
					<></> // Display nothing if not editing companies
				}

				{ // Storefront website input
					editMetadataField == "storefronts" ?
					<>
						<label htmlFor="editMetadataStorefrontWebsite">Storefront website: </label>
						<input type="text"
						name="storefrontWebsite"
						id="editMetadataStorefrontWebsite"
						placeholder="Storefront website URL..."
						value={storefrontWebsite}
						onChange={(e) => {
							setStorefrontWebsite(e.currentTarget.value);
						}}/>
					</> :
					<></> // Display nothing if not editing storefronts
				}

				{ // platform owner selection
					editMetadataField == "platforms" ?
					<>
						<label htmlFor="editMetadataPlatformOwner">Platform owner: </label>
						<Select
							name="platformOwner"
							inputId="editMetadataPlatformOwner"
							styles={selectStyles}
							value={selectedPlatformOwner}
							onChange={(option: OnChangeValue<OptionType, boolean>) => {
								setSelectedPlatformOwner(option as OptionType);
							}}
							options={platformOwnersList.data}
							isClearable
							required
						/>
					</> :
					<></> // Display nothing if not editing companies
				}

				<Btn type="submit" style={BtnStyle.Primary}>Add Option</Btn>
			</form>
			
			<form onSubmit={handleEditListRemove} method="post" id="removeMetadataForm" className="modal-section accent-(--color-accent) flex flex-col gap-1.5">
				<h3 className="text-xl">Remove</h3>
				<label htmlFor="editMetadataRemove">Options to remove: </label>
				<Select
					name="editMetadataRemove"
					inputId="editMetadataRemove"
					styles={selectStyles}
					closeMenuOnSelect={false}
					isMulti
					value={selectedForRemoval}
					onChange={(options: OnChangeValue<OptionType, boolean>) => {
						setSelectedForRemoval(options as OptionType[]);
					}}
					options={removeList.data}
				/>
				<Btn type="button" style={BtnStyle.Danger} func={() => setIsDeleteConfirmOpen(true)}>Remove Selected</Btn>

				<Modal
				isOpen={isDeleteConfirmOpen}
				onConfirm={() => {
					const form: HTMLFormElement = document.getElementById("removeMetadataForm") as HTMLFormElement;
					form.requestSubmit(); // Emulate the user clicking a submit button on modal confirmation.

					setIsDeleteConfirmOpen(false);
				}}
				onClose={() => {setIsDeleteConfirmOpen(false)}}
				isForm={true}>
					<h2 className="text-2xl">Confirm Metadata Removal?</h2>
					<div className="modal-section">
						<p>Are you sure you want to remove the selected metadata?</p>
						<p>If there are games using this metadata, it will be removed from those games.</p>
						<br />
						<p><b className="font-bold text-(--color-danger)">This action can NOT be undone!</b></p>
					</div>
				</Modal>
			</form>
		</Modal>
	);
}