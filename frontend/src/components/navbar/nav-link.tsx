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
		className='basis-1/3 sm:basis-24 text-center p-2.5 border-b-2 hover:bg-primary-focus font-medium'
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