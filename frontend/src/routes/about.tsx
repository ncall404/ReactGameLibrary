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
					<h2 className="text-2xl">Future Project Plans and Desires</h2>
					<p>...</p>
				</article>

				<article>
					<h2 className="text-2xl">Technology Used</h2>
					<p className="mt-1 text-xl">Used Throughout:</p>
					<ul>
						<li><b>Logic:</b> <a href="https://www.typescriptlang.org/">Typescript</a></li>
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
