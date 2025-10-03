// Main website navigation bar

import NavLink from './nav-link';

// TODO: Decide if you need to use useState or if you can just keep track of the active tab using tanstack router
// TODO: Make the nav bar stick at the top of the screen once you have content to test it with
export default function MainNav() {
	return (
		<nav className='flex max-sm:justify-center rounded-sm m-[5px] sm:px-[10px] bg-(--color-primary) text-(--color-light)'>
			<NavLink to="/" >Library</NavLink>
			{/* <NavLink to="/wishlist">Wishlist</NavLink> */}
			<NavLink to="/settings">Settings</NavLink>
			<NavLink to="/about">About</NavLink>
		</nav>
	);
}