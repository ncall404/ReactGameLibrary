// WIP component

import Modal from "../common/modal.tsx";
import Btn from "../common/btn.tsx";
import { BtnStyle } from "../common/btn.tsx";

import Select from "react-select";
import type { MultiValue, SingleValue } from "react-select";
import type { OptionType, GroupedOption } from "../../types/selectOptionType.ts";
import { fillGroupedOptionsArray, fillOptionsArray, optionsToString } from "../../utilities.ts";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getMetadata, MetadataField } from "../../api/gameMetadataApi.ts";

type MetadataType = "genres" | "companies" | "platforms" | "storefronts";

type EditMetadataModalProps = {
	//optionData: OptionType[] | GroupedOption[] | undefined;
	metadataType: MetadataType;
	isOpen: boolean;
	onClose: () => void;
}

export default function EditMetadataModal(props: EditMetadataModalProps) {
	const queryClient = useQueryClient();

	const editListType = props.metadataType;
	const baseApi: string = 'http://localhost:3000/api/metadata/';
	const api = baseApi.concat(editListType);

	// States for add form.
	const [editMetadataAdd, setEditMetadataAdd] = useState<string>("");
	const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<OptionType[]>([]);
	const [selectedPlatformOwner, setSelectedPlatformOwner] = useState<OptionType>();
	const [storefrontWebsite, setStorefrontWebsite] = useState<string>("");
	// States for remove form.
	const [selectedForRemoval, setSelectedForRemoval] = useState<OptionType[]>([]);

	const [removeOptions, setRemoveOptions] = useState<OptionType[] | GroupedOption[]>([]);

	// Mutation for adding metadata.
	const editMetadataAddMutation = useMutation({
		mutationFn: async(formData: FormData) => {
			const res = await fetch(api.concat("/add"), {
				method: 'POST',
				body: formData,
			});
			if (!res.ok) throw new Error('Failed to add to ' + props.metadataType);
			return res.json();
		},
		onSuccess: async (data) => {
			console.log('Uploaded: ', data);
			// Clear state for inputs.
			switch (editListType) {
				case "companies":
					setSelectedCompanyTypes([])
					break;
				case "platforms":
					setSelectedPlatformOwner(undefined);
					break;
				case "storefronts":
					setStorefrontWebsite("");
			}
			setEditMetadataAdd("");

			// Invalidate data that possibly changed.
			await invalidateData();
			// Refetch data and update available options for select.
			if (editListType == 'companies') {
				await companiesList.refetch();
			} else {
				await removeList.refetch();
			}
			fillRemoveOptions();
		},
		onError: (err) => console.error('Error: ', err),
	});
	// Mutation for removing metadata.
	const editMetadataRemoveMutation = useMutation({
		mutationFn: async(formData: FormData) => {
			const res = await fetch(api.concat("/remove"), {
				method: 'POST',
				body: formData,
			});
			if (!res.ok) throw new Error('Failed to remove from ' + props.metadataType);
			return res.json();
		},
		onSuccess: async (data) => {
			console.log('Uploaded: ', data);
			// Clear state for inputs.
			setSelectedForRemoval([]);
			// Invalidate data that possibly changed.
			await invalidateData();
			// Refetch data and update available options for select.
			// TODO: TODO: TODO: TODO: TODO: TODO: TODO: TODO: This isn't updating the "companies" queries outside of this component (the separate developer and publisher ones).
			if (editListType == 'companies') {
				await companiesList.refetch();
			} else {
				await removeList.refetch();
			}
			fillRemoveOptions();
		},
		onError: (err) => console.error('Error: ', err),
	});

	const invalidateData = async () => {
		await queryClient.invalidateQueries({queryKey: [editListType]});
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
		if (selectedPlatformOwner !== undefined) {
			setSelectedPlatformOwner(undefined);
		}
		if (storefrontWebsite.length > 0) {
			setStorefrontWebsite("");
		}
	}

	// TODO: Probably move this and a portion of fillRemoveOptions to a custom hook to do the conditional logic in and not needlessly query the server with the unused one. Not until this version is functioning though.
	const removeList = useQuery({
		queryKey: ['metadata', editListType],
		queryFn: () => getMetadata(editListType)
	});

	const companiesList = useQuery({
		queryKey: ['metadata', 'companies', 'all-companies'],
		queryFn: () => getMetadata(MetadataField.Companies),
	});

	const companyTypesList = useQuery({
		queryKey: ['metadata', 'company-types'],
		queryFn: () => getMetadata(MetadataField.CompanyType),
	})

	const platformOwnersList = useQuery({
		queryKey: ['metadata', 'platform-owners'],
		queryFn: () => getMetadata(MetadataField.PlatformOwners),
	});

	
	// Functions to fill the options for the react-select inputs
		// Function to fill the options of metadata to remove from a category.
	const fillRemoveOptions = (): OptionType[] | GroupedOption[] => {
		let queryDataList;
		if (editListType === "companies") {
			queryDataList = companiesList;
		} else {
			queryDataList = removeList;
		}

		if (!queryDataList.data) return []; // If no data is found then return an empty array.

		if (editListType !== "platforms") {
			return fillOptionsArray(queryDataList.data);
		} else {
			return fillGroupedOptionsArray(queryDataList.data);
		}
	}
		// Fills the possible company types for the add metadata form.
	const fillCompanyTypes = (): OptionType[] => {
		if (!companyTypesList.data) return [];

		const companyTypes: OptionType[] = [];
		if (companyTypesList.data) {
			companyTypesList.data?.map((companyType: {CompanyTypeID: number, Title: string}) => {
				companyTypes.push({value: companyType.CompanyTypeID, label: companyType.Title});
			});
		}
		return companyTypes;
	}
		// Fills the possible platform owners for the add metadata form.
	const fillPlatformOwners = (): OptionType[] => {
		if (!platformOwnersList.data) return [];

		const platformOwners: OptionType[] = [];
		if (platformOwnersList.data) {
			platformOwnersList.data?.map((platformOwner: {CompanyID: number, Title: string}) => {
				platformOwners.push({value: platformOwner.CompanyID, label: platformOwner.Title});
			});
		}
		return platformOwners;
	}

	// NOTE: fillRemoveOptions does not work out in the dependencies array (even as a useCallback function); it causes repeated updates.
	useEffect(() => {
		if (companiesList.data  && companiesList.isStale) {
			setRemoveOptions(fillRemoveOptions());
		}
	}, [companiesList.data, companiesList.isStale]);

	useEffect(() => {
		if (removeList.data && removeList.isStale) {
			setRemoveOptions(fillRemoveOptions());
		}
	}, [removeList.data, removeList.isStale]);


	const handleEditListAdd = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('metadataType', props.metadataType);
		formData.append('metadataAddTitle', editMetadataAdd);
		switch (editListType) {
			case "companies":
				formData.append('companyTypes', optionsToString(selectedCompanyTypes));
				break;
			case "storefronts":
				formData.append('storefrontWebsite', storefrontWebsite);
				break;
			case "platforms":
				formData.append('platformOwner', selectedPlatformOwner?.value.toString() as string);
		}
		editMetadataAddMutation.mutate(formData);
	}

	const handleEditListRemove = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('editMetadataRemove', optionsToString(selectedForRemoval));
		editMetadataRemoveMutation.mutate(formData);
	}


	return (
		<Modal isOpen={props.isOpen} onClose={props.onClose}>
			<h2 className="text-2xl">{editListType.charAt(0).toUpperCase().concat(editListType.slice(1))}</h2>
			<form onSubmit={handleEditListAdd} method="post" className="bg-(--color-darker) rounded-sm p-4 mt-2 accent-(--color-accent) flex flex-col gap-1.5">
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
					editListType == "companies" ?
					<>
						<label htmlFor="editMetadataCompanyTypes">Company type(s): </label>
						<Select
							name="companyTypes"
							inputId="editMetadataCompanyTypes"
							className="text-(--color-dark) cursor-pointer"
							closeMenuOnSelect={false}
							isMulti
							value={selectedCompanyTypes}
							onChange={(options: MultiValue<OptionType>) => {
								setSelectedCompanyTypes(options as OptionType[]);
							}}
							options={fillCompanyTypes()}
							required
						/>
					</> :
					<></> // Display nothing if not editing companies
				}

				{ // Storefront website input
					editListType == "storefronts" ?
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
					editListType == "platforms" ?
					<>
						<label htmlFor="editMetadataPlatformOwner">Platform owner: </label>
						<Select
							name="platformOwner"
							inputId="editMetadataPlatformOwner"
							className="text-(--color-dark) cursor-pointer"
							value={selectedPlatformOwner}
							onChange={(option: SingleValue<OptionType>) => {
								setSelectedPlatformOwner(option as OptionType);
							}}
							options={fillPlatformOwners()}
							isClearable
							required
						/>
					</> :
					<></> // Display nothing if not editing companies
				}

				<Btn type="submit" style={BtnStyle.Primary}>Add Option</Btn>
			</form>
			<hr />
			<form onSubmit={handleEditListRemove} method="post" className="bg-(--color-darker) rounded-sm p-4 mt-2 accent-(--color-accent) flex flex-col gap-1.5">
				<h3 className="text-xl">Remove</h3>
				<label htmlFor="editMetadataRemove">Options to remove: </label>
				<Select
					name="editMetadataRemove"
					inputId="editMetadataRemove"
					className="text-(--color-dark) cursor-pointer"
					closeMenuOnSelect={false}
					isMulti
					value={selectedForRemoval}
					onChange={(options: MultiValue<OptionType>) => {
						setSelectedForRemoval(options as OptionType[]);
					}}
					options={removeOptions}
				/>
				<Btn type="submit" style={BtnStyle.Primary}>Remove Selected</Btn>
			</form>
		</Modal>
	);
}

export type {MetadataType};