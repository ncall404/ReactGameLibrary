// btn.tsx: Button component

// Object as const for defining a button style.
export const BtnStyle = {
	Primary: "PRIMARY",
	Danger: "DANGER",
	Neutral: "NEUTRAL",
} as const;
type BtnStyle = (typeof BtnStyle)[keyof typeof BtnStyle]; // Create union type from BtnStyle.


type BtnProps = {
	className?: string; // Makes the styles easily extensible if there is a more limited scope button style needed.
	style?: BtnStyle; // Main button styling.
	type?: "button" | "submit" | "reset" | undefined
	func?: () => void; // onClick function.
	children?: React.ReactNode;
}

export default function Btn(props: BtnProps) {
	// Set main button styling based on button type.
	let buttonStyles: string;
	switch (props.style) {
		case BtnStyle.Primary:
			buttonStyles = "border-(--color-accent) hover:bg-(--color-accent) hover:text-(--color-dark)";
			break;
		case BtnStyle.Danger:
			buttonStyles = "border-(--color-danger) hover:bg-(--color-danger)";
			break;
		case BtnStyle.Neutral:
			buttonStyles = "border-(--color-neutral) hover:bg-(--color-neutral)";
			break;
		default:
			buttonStyles = "border-(--color-neutral) hover:bg-(--color-neutral)";
			break;
	}

	return (
		<button 
		className={"p-[5px] border-y-3 rounded-xs cursor-pointer text-(--color-light) bg-(--color-dark) font-medium "
			+ buttonStyles + " " + props.className}
		type={props.type}
		onClick={props.func}>
			{props.children}
		</button>
	);
}