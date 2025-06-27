// Settings page component and route. Displays app settings and allows the user to change them.

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
		<section>
			<h1 className='text-2xl'>Settings</h1>
		</section>
	);
}
