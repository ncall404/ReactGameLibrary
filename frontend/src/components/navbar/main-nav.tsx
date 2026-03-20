// Main website navigation bar

import NavLink from './nav-link';

// TODO: Make the nav bar stick at the top of the screen
export default function MainNav() {
	return (
		<nav className='flex gap-1.5 max-sm:justify-center sm:rounded-sm m-0 mb-2 sm:m-2 sm:px-3 bg-(--color-primary) text-(--color-light)'>
			<NavLink to="/" >Library</NavLink>
			{/* <NavLink to="/wishlist">Wishlist</NavLink> NOTE: Wishlist development paused */}
			<NavLink to="/settings">Settings</NavLink>
			<NavLink to="/about">About</NavLink>
		</nav>
	);
}