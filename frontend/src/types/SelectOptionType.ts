// Types for the React-Select component's options.

// Type for the Select component data to use.
type OptionType = {
	value: number; // ID related to the displayed label.
	label: string;
}
// Type for the Select component to be able to group items.
type GroupedOption = {
	label: string; // Grouping label.
	options: OptionType[];
}

export type {OptionType, GroupedOption};