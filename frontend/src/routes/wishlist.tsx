// Wishlist page component and route. Displays selected wishlist of games.

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wishlist')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
		<section>
			<h1 className='text-2xl'>Game Wishlist</h1>
		</section>
	);
}
