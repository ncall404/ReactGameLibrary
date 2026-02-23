// Customized version of the TanStackRouter Link component for the main-nav.tsx component.

import { Link } from "@tanstack/react-router";

type NavLinkProps = {
	to: string,
	children?: React.ReactNode,
}

export default function NavLink(props: NavLinkProps) {
	return (
		<Link
		to={props.to}
		className='max-sm:flex-grow max-sm:text-center p-[10px] border-b-2 hover:bg-(--color-primary-focus) font-medium'
		activeProps={{
			className:"border-(--color-accent) border-b-4 pb-[8px]",
		}}
		inactiveProps={{
			className:"hover:border-(--color-accent) focus:border-(--color-accent)",
		}}>
			{props.children}
		</Link>
	);
}