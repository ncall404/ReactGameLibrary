// Main page layout and the root of the TanStackRouter route tree.

import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';

import MainNav from '../components/navbar/main-nav';

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	return (
		<React.Fragment>
			<header>
				<MainNav />
			</header>
			
			<main className='m-1 mx-2 dark:text-(--color-light)'>
				<Outlet />
			</main>
		</React.Fragment>
	);
}
