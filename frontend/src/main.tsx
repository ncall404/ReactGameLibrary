// Main file that the app starts/builds from.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
		</QueryClientProvider>
	</StrictMode>,
);

// Database Server Connection Test (TODO: DELETE AT SOME POINT)
/* const res = await fetch('http://localhost:3000/api/libraries/1/games');
const data = await res.json();
console.log(data); */