// Main website navigation bar

import NavLink from "./nav-link";

export default function MainNav() {
	return (
		<nav className="flex gap-1.5 shadow-md/30 max-sm:justify-center sm:rounded-sm m-0 mb-2 sm:m-2 sm:px-3 bg-primary text-light">
			<NavLink to="/" >Library</NavLink>
			{/* <NavLink to="/wishlist">Wishlist</NavLink> NOTE: Wishlist development paused */}
			<NavLink to="/settings">Settings</NavLink>
			<NavLink to="/about">About</NavLink>
		</nav>
	);
}