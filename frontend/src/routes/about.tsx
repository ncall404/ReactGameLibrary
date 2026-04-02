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

				<article>
					<h2 className="text-2xl">What I've Learned</h2>
					<p>...</p>
				</article>
				<article>
					<h2 className="text-2xl">What I Would Do Different</h2>
					<p>...</p>
				</article>

				<article>
					<h2 className="text-2xl">Future Plans And Desires For The Project</h2>
					<p>There are many things that I would like to do in the future to improve and iterate on this project. Some of them are things that I needed to cut or ran out of time to implement for the current version; others are things that I would like to do for completely new versions of the project.</p>
					<p className="mt-4">Here are some of the things I have in mind:</p>

					<p className="mt-4 text-xl">For this project:</p>
					<ul>
						<li>Change toast notifications to be a list to allow more than one showing at once.</li>
						<li>Make a light mode color scheme option.</li>
						<li>Improve dark mode color scheme.</li>
						<li>Client-side form validation.</li>
						<li>Lazy loading of game collections.</li>
						<li>A way to delete unused game cover art images.</li>
					</ul>

					<p className="text-xl">For future versions of the project:</p>
					<ul>
						<li>Make a native desktop app.</li>
						<li>Make a wishlist feature with price tracking for storefronts with available APIs.</li>
					</ul>
				</article>

				<article>
					<h2 className="text-2xl">Technology Used</h2>
					<p className="mt-1 text-xl">Used Throughout:</p>
					<ul>
						<li><b>Logic:</b> <a href="https://www.typescriptlang.org/">TypeScript</a></li>
						<li><b>Runtime:</b> <a href="https://nodejs.org/en">NodeJS</a></li>
						<li><b>Package Manager:</b> <a href="https://www.npmjs.com/">NPM (Node Package Manager)</a></li>
					</ul>
					<p className="mt-1 text-xl">Front End Tech:</p>
					<ul>
						<li><b>Layout:</b> HTML and <a href="https://react.dev/">React</a></li>
						<li><b>Styling:</b> CSS and <a href="https://tailwindcss.com/">Tailwind</a></li>
						<li><b>Routing and Queries:</b> <a href="https://tanstack.com/router/latest">Tanstack Router</a> and <a href="https://tanstack.com/query/latest">Tanstack Query</a></li>
						<li><b>Server:</b> <a href="https://vite.dev/">Vite</a> (via the dev server)</li>
					</ul>

					<p className="mt-1 text-xl">Back End Tech:</p>
					<ul>
						<li><b>Server Framework:</b> <a href="https://hono.dev/">Hono</a></li>
						<li><b>Database:</b> <a href="https://sqlite.org/">SQLite</a> through <a href="https://github.com/WiseLibs/better-sqlite3">better-sqlite3</a></li>
					</ul>
				</article>

				<article>
					<h2 className="text-2xl">Created By:</h2>
					<p>Nathan Call</p>
				</article>
			</div>
			
		</section>
	);
}
