// Utility functions likely to be used across more than one other file.

// Takes the first letter of a string and changes it to upper-case.
const upperFirstLetter = (source: string): string => {
	return source.charAt(0).toUpperCase().concat(source.slice(1));
}

export {upperFirstLetter};