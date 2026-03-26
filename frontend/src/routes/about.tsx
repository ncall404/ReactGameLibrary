// About page component and route. Displays information about the app and developer (me!).

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
		<section>
			<h1 className='text-3xl pb-2'>About</h1>

			<div className="flex flex-col gap-1">
				<article>
					<h2 className="text-2xl">Project Purpose</h2>
					<p>...</p>
				</article>
			</div>
			
		</section>
	);
}
