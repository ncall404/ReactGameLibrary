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

export {optionsToString};