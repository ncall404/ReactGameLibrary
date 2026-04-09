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
					<h2 className="text-2xl">Project By:</h2>
					<p>Nathan Call</p>
				</article>

				<article>
					<h2 className="text-2xl">What This Project Is</h2>
					<p>This project is a web app for tracking a collection of video games across platforms. The purpose of this project was for both learning and practice.</p>
					<p>Some specific technologies that I wanted to learn and practice with were the following:</p>
					<ul>
						<li>
							TypeScript
							<ul>
								<li>I had only used TypeScript a small amount before and I wanted to get to know the language since it has become so widely used. I had prior experience with C# and other typed languages so it wasn't too difficult to get used to.</li>
							</ul>
						</li>
						<li>
							React
							<ul>
								<li>For react I took a class in college that had us use React for a couple of weeks. I have followed some tutorials as well.</li>
							</ul>
						</li>
						<li>
							Tailwind
							<ul>
								<li>Tailwind has become a widely used CSS library by large companies so I decided to try it out. Once again, I had only used it a small amount before and was mostly used to custom CSS and bootstrap components.</li>
							</ul>
						</li>
						<li>
							SQLite
							<ul>
								<li>SQLite is the most used database engine and is available on most devices by default. Because of this I decided it would be good to learn SQLite. I took a couple of database classes in college around designing databases so I had some experience already. Additionally I had used both MySQL and Microsoft SQL Server.</li>
							</ul>
						</li>
					</ul>
				</article>

				<article>
					<h2 className="text-2xl">Technology Used</h2>
					<h3 className="mt-1 text-xl">Used Throughout:</h3>
					<ul>
						<li><b>Logic:</b> <a href="https://www.typescriptlang.org/">TypeScript</a></li>
						<li><b>Runtime:</b> <a href="https://nodejs.org/en">NodeJS</a></li>
						<li><b>Package Manager:</b> <a href="https://www.npmjs.com/">NPM (Node Package Manager)</a></li>
					</ul>
					<h3 className="mt-1 text-xl">Front End Tech:</h3>
					<ul>
						<li><b>Layout:</b> HTML and <a href="https://react.dev/">React</a></li>
						<li><b>Styling:</b> CSS and <a href="https://tailwindcss.com/">Tailwind</a></li>
						<li><b>Routing and Queries:</b> <a href="https://tanstack.com/router/latest">Tanstack Router</a> and <a href="https://tanstack.com/query/latest">Tanstack Query</a></li>
						<li><b>Server:</b> <a href="https://vite.dev/">Vite</a> (via the dev server)</li>
					</ul>

					<h3 className="mt-1 text-xl">Back End Tech:</h3>
					<ul>
						<li><b>Server Framework:</b> <a href="https://hono.dev/">Hono</a></li>
						<li><b>Database:</b> <a href="https://sqlite.org/">SQLite</a> through <a href="https://github.com/WiseLibs/better-sqlite3">better-sqlite3</a></li>
					</ul>
				</article>

				<article>
					<h2 className="text-2xl">What I've Learned</h2>
					<h3 className="mt-1 text-xl">Planning</h3>
					<ul>
						<li>It's hard to keep scope realistic when it's the first sizable project you have planned by yourself.</li>
						<li>You need to be willing to scrap and replan features.</li>
					</ul>
					<h3 className="text-xl">Technologies</h3>
					<ul>
						<li>
							TypeScript
							<ul>
								<li>Overall it feels like a nice mix of JavaScript with some stuff from C#.</li>
								<li>Being able to make custom types so easily is nice.</li>
								<li>There are some pain points where you can definitely feel that it is a language built on top of JavaScript. One instance is the suggested way (by the language creators) to do an enum-like structure being an "object as const" instead of just the enum keyword due to performance and compiling reasons. It makes more boilerplate necessary where it really shouldn't be. This also makes the language feel just a little messier to use.</li>
							</ul>
						</li>
						<li>
							Tailwind
							<ul>
								<li>Is fast for prototyping components.</li>
								<li>Good for quickly seeing how a portion of HTML/JSX/TSX is going to look without having to switch to the CSS file.</li>
								<li>Is very flexible and extensible. I was able to add custom breakpoints and colors very easliy.</li>
								<li>The provided variables can be useful in custom CSS.</li>
								<li>It can get messy easily due to the styles being inline with the tags.</li>
							</ul>
						</li>
						<li>
							React
							<ul>
								<li>Making components that use dynamic data is pretty nice compared to vanilla HTML/CSS/Javascript.</li>
								<li>Sometimes its better to just find a component that somebody else has already made rather than write your own. In my instance, I found the react-select component was convenient and worth using compared to the idea of creating my own multi-select dropdown menu.</li>
								<li>State management and placement can be somewhat messy.</li>
							</ul>
						</li>
						<li>
							SQLite
							<ul>
								<li>It's similar to MySQL and SQL Server for the most part for a simple database.</li>
								<li>There are less/different data types than the other options. This can be both good and bad. Its nice not needing to define the number of characters for text fields. The lack of a built-in date-time type was a little annoying but wasn't too bad to find a solution for.</li>
								<li>Not needing to do any extra software installations to get SQLite to work is very nice.</li>
								<li>There are some nice JavaScript/TypeScript packages that make writing queries for SQLite easy. In my instance I used better-sqlite3</li>
							</ul>
						</li>
					</ul>

				</article>
				<article>
					<h2 className="text-2xl">What I Would Do Different</h2>
					<p>...</p>
				</article>

				<article>
					<h2 className="text-2xl">Future Plans And Desires For The Project</h2>
					<p>There are many things that I would like to do in the future to improve and iterate on this project. Some of them are things that I needed to cut or ran out of time to implement for the current version; others are things that I would like to do for completely new versions of the project.</p>
					<p className="mt-4">Here are some of the things I have in mind:</p>

					<h3 className="mt-4 text-xl">For this project:</h3>
					<ul>
						<li>Change toast notifications to be a list to allow more than one showing at once.</li>
						<li>Make a light mode color scheme option.</li>
						<li>Improve dark mode color scheme.</li>
						<li>Client-side form validation.</li>
						<li>Lazy loading of game collections.</li>
						<li>A way to delete unused game cover art images.</li>
					</ul>

					<h3 className="text-xl">For future versions of the project:</h3>
					<ul>
						<li>Make another web version that doesn't need a separate backend server process. This would be done by using a technology to do everything for storage client-side such as SQLite-WASM.</li>
						<li>Make a native desktop app.</li>
						<li>Make a wishlist feature with price tracking for storefronts with available APIs.</li>
					</ul>
				</article>
			</div>
			
		</section>
	);
}
