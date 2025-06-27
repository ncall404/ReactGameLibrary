// Placeholder button component

interface BtnProps {
	children?: React.ReactNode,
}

export default function Btn(props: BtnProps) {
	return (
		<div>
			{props.children}
		</div>
	);
}