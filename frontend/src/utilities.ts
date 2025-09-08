// Utility functions used across more than one other file.

import type { OptionType } from "./types/selectOptionType";

// Converts the selected options from Select inputs to a string format that can be sent to the backend.
const optionsToString = (options: OptionType[]) => {
	let selected: string = "";
	options.forEach((option) => {
		selected = selected.length > 0 ?
			selected.concat(',', option.value.toString())
			:
			selected.concat(option.value.toString());
	});
	return selected;
}

// Uses JSON data to fill an array of OptionType
//	Expects array of objects holding 2 or 3 values (number, string) or (number, string, string) in the order of (value, label) or (value, label, labelExtras)
const fillOptionsArray = (optionsData: Array<Record<string, string | number>>) => {
	if (!optionsData) return [];

	const optionsArray: OptionType[] = [];
	optionsData?.map((data) => {
		const objectData = Object.values(data);

		if (objectData.length === 2 && typeof objectData[0] === 'number' && typeof objectData[1] === 'string') {
			optionsArray.push({value: objectData[0], label: objectData[1]});
		}
		else if (objectData.length === 3 && typeof objectData[0] === 'number' && typeof objectData[1] === 'string' && typeof objectData[2] === 'string') {
			optionsArray.push({value: objectData[0], label: objectData[1] + ": " + objectData[2]});
		}
	});
	return optionsArray;
}

// Uses JSON data to fill an array of GroupedOption. 
// 	Expects array of objects holding 3 values (number, string, string) in the order of (value, label, group).
const fillGroupedOptionsArray = (optionsData: Array<Record<string, string | number>>) => {
	if (!optionsData) return [];
	const grouped = new Map<string, OptionType[]>();

	optionsData?.map((data) => {
		const objectData = Object.values(data);
		if (objectData.length === 3 && typeof objectData[0] === 'number' && typeof objectData[1] === 'string' && typeof objectData[2] === 'string') {
			const group = objectData[2];
			const option: OptionType = {value: objectData[0], label: objectData[1]};

			if (!grouped.has(group)) {
				grouped.set(group, []);
			}
			grouped.get(group)!.push(option);
		} else {
			return;
		}
	});

	return Array.from(grouped.entries()).map(([label, options]) => ({label, options}));
}

export {optionsToString, fillOptionsArray, fillGroupedOptionsArray};