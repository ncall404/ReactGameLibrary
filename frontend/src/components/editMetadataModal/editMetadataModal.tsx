// WIP component

import Modal from "../common/modal.tsx";
import Btn from "../common/btn.tsx";
import { BtnStyle } from "../common/btn.tsx";

import Select from "react-select";
import type { MultiValue } from "react-select";
import type { OptionType, GroupedOption } from "../../types/selectOptionType.ts";
import { optionsToString } from "../../utilities.ts";

import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getMetadata, MetadataField } from "../../api/gameMetadataApi.ts";

type MetadataType = "genres" | "companies" | "platforms" | "storefronts";

type EditMetadataModalProps = {
	optionData: OptionType[] | GroupedOption[] | undefined;
	metadataType: MetadataType;
	isOpen: boolean;
	onClose: () => void;
}

export default function EditMetadataModal(props: EditMetadataModalProps) {
	const editListType = props.metadataType;
	const baseApi: string = 'http://localhost:3000/api/metadata/';
	const api = baseApi.concat(editListType);

	const [editMetadataAdd, setEditMetadataAdd] = useState<string>("");
	/* const [storefrontWebsite, setStorefrontWebsite] = useState<string>("");
	const [platformOwner, setPlatformOwner] = useState<OptionType>();
	const [companyType, setCompanyType] = useState<OptionType>(); */

	const [selectedForRemoval, setSelectedForRemoval] = useState<OptionType[]>([]);

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
		onSuccess: (data) => {console.log('Uploaded: ', data)},
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
		onSuccess: (data) => {console.log('Uploaded: ', data)},
		onError: (err) => console.error('Error: ', err),
	});

	
	if (!props.isOpen && selectedForRemoval.length > 0) { // Clear selected options if the modal is closed.
		setSelectedForRemoval([]);
	}

	const companiesList = useQuery({
		queryKey: ['http://localhost:3000/api/metadata/companies'],
		queryFn: () => getMetadata(MetadataField.Companies),
	});

	const companyTypesList = useQuery({
		queryKey: ['http://localhost:3000/api/metadata/copmany-types'],
		queryFn: () => getMetadata(MetadataField.CompanyType),
	})

	const fillOptions = (): OptionType[] | GroupedOption[] => {
		// Fill the option data with companies if the passed in optionsData is undefined and metadataType is "companies".
		if (props.optionData === undefined && props.metadataType === "companies") {
			if (!companiesList) return [];

			const grouped = new Map<string, OptionType[]>();

			if (companiesList.data) {
				companiesList.data?.forEach((company: {CompanyID: number, Title: string, CompanyTypes: string}) => {
					const cTypes = company.CompanyTypes.replaceAll(',', ', ');

					const option: OptionType = {value: company.CompanyID, label: company.Title}

					if (!grouped.has(cTypes)) {
						grouped.set(cTypes, []);
					}
					grouped.get(cTypes)!.push(option);
				});

				return Array.from(grouped.entries()).map(([label, options]) => ({label, options}));
			}
		}

		if (props.optionData !== undefined) return props.optionData; // Return previously-filled-in option data.
		
		return [] // If other attempts to fill the data have failed, return empty array.
	}

	const fillCopmanyTypes = (): OptionType[] => {
		if (!companyTypesList.data) return [];

		const genres: OptionType[] = [];
		if (companyTypesList.data) {
			companyTypesList.data?.map((companyType: {CompanyTypeID: number, Title: string}) => {
				genres.push({value: companyType.CompanyTypeID, label: companyType.Title});
			});
		}
		return genres;
	}


	const handleEditListAdd = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('metadataType', props.metadataType);
		formData.append('editMetadataAdd', editMetadataAdd);
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
			<form onSubmit={handleEditListAdd} method="post" className="bg-(--color-darker) rounded-sm p-4 mt-2 accent-(--color-accent) flex flex-col gap-1.5">
				<label htmlFor="editMetadataAdd">Add to {editListType.charAt(0).toUpperCase().concat(editListType.slice(1))}: </label>
				<input type="text"
				name="editMetadataAdd"
				id="editMetadataAdd"
				placeholder="Option to add..."
				required
				onChange={(e) => {
					setEditMetadataAdd(e.currentTarget.value);
				}}
				/>

				{ // Company type selection
					editListType == "companies" ?
					<>
						<label htmlFor="editMetadataCompanyType">Company Type: </label>
						<Select
							name="editMetadataCompanyType"
							inputId="editMetadataCompanyType"
							className="text-(--color-dark) cursor-pointer"
							closeMenuOnSelect={false}
							isMulti
							value={selectedForRemoval}
							onChange={(options: MultiValue<OptionType>) => {
								setSelectedForRemoval(options as OptionType[]);
							}}
							options={fillCopmanyTypes()}
							required
						/>
					</> :
					<></> // Display nothing if not companies
				}

				<Btn type="submit" style={BtnStyle.Primary}>Add Option</Btn>
			</form>
			<hr />
			<form onSubmit={handleEditListRemove} method="post" className="bg-(--color-darker) rounded-sm p-4 mt-2 accent-(--color-accent) flex flex-col gap-1.5">
				<label htmlFor="editMetadataRemove">Remove from {editListType.charAt(0).toUpperCase().concat(editListType.slice(1))}: </label>
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
					options={fillOptions()}
				/>
				<Btn type="submit" style={BtnStyle.Primary}>Remove Option(s)</Btn>
			</form>
		</Modal>
	);
}

export type {MetadataType};