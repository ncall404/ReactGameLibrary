// Main website navigation bar

import NavLink from './nav-link';

// TODO: Make the nav bar stick at the top of the screen
export default function MainNav() {
	return (
		<nav className='flex gap-1.5 max-sm:justify-center rounded-sm m-[5px] sm:px-[10px] bg-(--color-primary) text-(--color-light)'>
			<NavLink to="/" >Library</NavLink>
			{/* <NavLink to="/wishlist">Wishlist</NavLink> NOTE: Wishlist development paused */}
			<NavLink to="/settings">Settings</NavLink>
			<NavLink to="/about">About</NavLink>
		</nav>
	);
}