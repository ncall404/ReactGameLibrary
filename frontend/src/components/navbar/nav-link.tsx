// Customized version of the TanStackRouter Link component for the main-nav.tsx component.

import { Link } from "@tanstack/react-router";

type NavLinkProps = {
	to: string,
	children?: React.ReactNode,
}

export default function NavLink(props: NavLinkProps) {
	return (
		<Link to={props.to} className='max-sm:flex-grow max-sm:text-center mx-[5px] p-[10px] border-(--color-light) border-b-2 hover:border-(--color-accent) focus:border-(--color-accent) font-medium'>
			{props.children}
		</Link>
	);
}