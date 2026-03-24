// Utility functions and types likely to be used across more than one other file.

import type { GroupBase, StylesConfig } from "react-select";
import type { OptionType } from "./types/SelectOptionType";

// Default times (in milliseconds) for the response messages that should be good for most normal message lengths. Message types that are generally more important for the user to see (especially errors) will stay on the screen significantly longer by default.
const messageTimeDefaults = {
	success: 7000,
	info: 9000,
	warning: 12000,
	error: 20000,
} as const;


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


// Takes the first letter of a string and changes it to upper-case.
const upperFirstLetter = (source: string): string => {
	return source.charAt(0).toUpperCase().concat(source.slice(1));
}


// Scrolls to the top of the page.
const scrollToTop = function scrollToTop() {
	window.scrollTo(0, 0);
}


// A style object to apply the same styles to all of the react-select components.
const selectStyles: StylesConfig<OptionType, boolean, GroupBase<OptionType>> = {
	control: (baseStyles) => ({
		...baseStyles,
		backgroundColor: "var(--color-input-bg)",
		borderColor: "var(--color-neutral)",
		cursor: "pointer",
	}),
	input: (baseStyles) => ({
		...baseStyles,
		color: "var(--color-light)",
	}),
	placeholder: (baseStyles) => ({
		...baseStyles,
		color: "var(--color-neutral)",
	}),

	menu: (baseStyles) => ({
		...baseStyles,
		backgroundColor: "var(--color-input-bg)",
		outlineStyle: "solid",
		outlineWidth: "1px",
		outlineColor: "var(--color-neutral)",
	}),
	menuList: (baseStyles) => ({
		...baseStyles,
		backgroundColor: "var(--color-input-bg)",
		borderRadius: "0.25rem",
	}),

	multiValue: (baseStyles) => ({
		...baseStyles,
		backgroundColor: "var(--color-neutral)",
		color: "var(--color-light)",
	}),
	multiValueLabel: (baseStyles) => ({
		...baseStyles,
		color: "var(--color-light)",
	}),

	singleValue: (baseStyles) => ({
		...baseStyles,
		color: "var(--color-light)",
	}),

	clearIndicator: (baseStyles) => ({
		...baseStyles,
		borderRadius: "0.25rem",
		cursor: "pointer",
		"&:hover": { // Uses the colors that react-select uses internally for the multiValueRemove inner-component.
			backgroundColor: "#FFBDAD",
			color: "#DE350B"
		}
	}),
	dropdownIndicator: (baseStyles) => ({
		...baseStyles,
		borderRadius: "0.25rem",
		cursor: "pointer",
		"&:hover": {
			backgroundColor: "var(--color-neutral)",
			color: "var(--color-light)",
		}
	}),

	option: (baseStyles, state) => ({
		...baseStyles,
		cursor: "pointer",
		color: "var(--color-light)",
		backgroundColor: state.isFocused ? "var(--color-neutral)" : ""
	}),
}

export {
	optionsToString, fillOptionsArray, fillGroupedOptionsArray,
	upperFirstLetter, scrollToTop, selectStyles, messageTimeDefaults
};