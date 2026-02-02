// Main file that the app starts/builds from.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { TanStackDevtools } from '@tanstack/react-devtools';
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import "./tailwind.css";


// Router Setup -------------------------------------------
// Import generated route tree
import { routeTree } from './routeTree.gen.ts';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

// Query client setup
const queryClient = new QueryClient();

// Render App ---------------------------------------------
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			{/* <TanStackDevtools plugins={[
				{
				name: 'TanStack Query',
				render: <ReactQueryDevtools />,
				},
				{
				name: 'TanStack Router',
				render: <TanStackRouterDevtools />,
				},
			]}
			/> */}
		</QueryClientProvider>
	</StrictMode>,
);