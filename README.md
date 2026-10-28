# Game Library

## Table of contents
- [Demonstration Video](#demonstration-video)
- [How To Run](#how-to-run)
	- [Prerequisite Installations](#prerequisite-installations)
	- [Installing](#installing)
		- [Installing Project Packages on Windows](#installing-project-packages-on-windows)
		- [Installing Project Packages on MacOS](#installing-project-packages-on-macos)
		- [Alternative Install On Windows, MacOS, and Linux](#alternative-install-on-windows-macos-and-linux)
	- [Running The Program](#running-the-program)
		- [Windows:](#windows)
		- [MacOS:](#macos)
		- [Alternative on Windows, MacOS, and Linux](#alternative-on-windows-macos-and-linux)
	- [Stopping The Program](#stopping-the-program)
- [What This Project Is](#what-this-project-is)
- [Technology Used](#technology-used)
- [What I've Learned](#what-ive-learned)
- [What I Would Do Different](#what-i-would-do-different)
- [Future Plans And Desires For The Project](#future-plans-and-desires-for-the-project)

---

## Demonstration Video
If you would like to see the project either before or without downloading then you can watch a small demonstration video on YouTube here: [https://youtu.be/F0nbHxWdJFA](https://youtu.be/F0nbHxWdJFA)

## How To Run
### Prerequisite Installations
- Node **26.13.0** or newer: [https://nodejs.org/en/download](https://nodejs.org/en/download)
- Node Package Manager (NPM) **(installed alongside Node)**
### Installing
There are two ways to download the project files:
- Clone the Github repository.
- Download the project zip file on Github

Both can be accessed by clicking on the bright green "Code" button at the top of the repository.
After it is downloaded, extract the files if you downloaded the zip, then follow the next steps based on your operating system.

#### Installing Project Packages on Windows
Run the script **setupWindows.bat** by double clicking it in the file explorer.
#### Installing Project Packages on MacOS
- Open the **ReactGameLibrary** project folder in a terminal/shell that supports Bash.
- Run the command: `sh setupMac.sh`
#### Alternative Install On Windows, MacOS, and Linux
If you don't want to run the scripts, or if they aren't working for you, then follow these steps instead:
- Open the **ReactGameLibrary** project folder in a terminal/shell.
- Run the command: `npm run install-all`

### Running The Program
The program uses ports `5173` and `3000` for the localhost servers.
#### Windows:
- Run the script **runWindows.bat** by double clicking it in the file explorer.
- Go to http://localhost:5173 in a browser of your choice.
#### MacOS:
- Open the **ReactGameLibrary** project folder in a terminal/shell that supports Bash.
- Run the command: `sh runMac.sh`
#### Alternative on Windows, MacOS, and Linux
If you don't want to run the scripts, or if they aren't working for you, then follow these steps instead:
- Open the **ReactGameLibrary** project folder in a terminal/shell.
- Run the command: `npm run dev`

After the prior steps for your operating system, go to http://localhost:5173 in a browser of your choice. The website should be there and running!

### Stopping The Program
To stop the program, go to the terminal that the run script opened. Next, do one of the following depending on preference: 
- Close the terminal and confirm that you want to stop the running processes.
- Use the key combo `CTRL + C` in the terminal and then close the terminal.

## What This Project Is
This project is a web app for tracking a collection of video games across platforms. The purpose of this project was for both learning and practice.

Some specific technologies that I wanted to learn and practice with were the following:
- TypeScript
  - I had only used TypeScript a small amount before and I wanted to get to know the language since it has become so widely used. I had prior experience with C# and other typed languages so it wasn't too difficult to get used to.
- React
  - For React I took a class in college that had us use it for a couple of weeks. I have followed some tutorials as well.
- Tailwind
  - Tailwind has become a widely used CSS libarary by large companies so I decided to try it out. Once again, I had only used it a small amount before and was mostly used to custom CSS and bootstrap components.
- SQLite
  - SQLite is the most used database engine and is available on most devices by default. Because of this I decided it would be good to learn SQLite. I took a couple of database classes in college around designing databases so I had some experience already. I had used both MySQL and Microsoft SQL Server.

## Technology Used
Used Throughout:
- Logic: [TypeScript](https://www.typescriptlang.org/)
- Runtime: [NodeJS](https://nodejs.org/en)
- Package Manager: [NPM (Node Package Manager)](https://www.npmjs.com/)

Front End Tech:
- Layout: HTML and [React](https://react.dev/)
- Styling: CSS and [Tailwind](https://tailwindcss.com/)
- Routing and Queries: [Tanstack Router](https://tanstack.com/router/latest) and [Tanstack Query](https://tanstack.com/query/latest)
- Server: [Vite](https://vite.dev/) (via the dev server)

Back End Tech:
- Server Framework: [Hono](https://hono.dev/)
- Database: [SQLite](https://sqlite.org/) through [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

## What I've Learned
Planning:
- It's hard to keep scope realistic; especially when it's the first sizable project you have planned by yourself.
- You need to be willing to scrap and replan features.

Technologies:
- TypeScript
  - Overall it feels like a nice mix of JavaScript with some stuff with C#.
  - Being able to make custom types so easily is nice.
  - There are some pain points where you can definitely feel that it is a language built on top of Javascript. One instance is the suggested way (by the language creators) to do an enum-like structure being an "object as const" instead of just the enum keyword due to performance and compiling reasons. It makes more boilerplate necessary where it really shouldn't be. This also makes the language feel just a little messier to use.
- Tailwind
  - Is fast for prototyping components.
  - Good for quickly seeing how a portion of HTML/JSX/TSX is going to look without having to switch to the CSS file.
  - Is very flexible and extensible. I was able to add custom breakpoints and colors very easily.
  - The provided variables can be useful in custom CSS.
  - It can get messy easily due to the styles being inline with the tags.
- React
  - Making components that use dynamic data is pretty nice compared to vanilla HTML/CSS/JavaScript.
  - Sometimes it's better to just find a component that somebody else has already made rather than write your own. In my instance, I found the react-select component was convenient and worth using compared to the idea of creating my own multi-select dropdown menu.
  - State management and placement can be somewhat messy.
- SQLite
  - It's similar to MySQL and SQL Server for the most part for a simple database.
  - There are less/different data types than the other options. This can be both good and bad. It's nice not needing to define the number of characters for text fields. The lack of a built-in date-time type was a little annoying but wasn't too bad to find a solution for.
  - Not needing to do any extra software installations to get SQLite to work is very nice.
  - There are some nice JavaScript/TypeScript packages that make writing queries for SQLite easy. In my instance I used better-sqlite3.

## What I Would Do Different
These are things I would do differently if I started the project with the knowledge I have now.

Planning:
- I would plan out the file structure of the project differently. It's not that it's bad right now, I just think it could be better. Particular improvements include naming consistency and removing dedicated folders for some fo the component files.
- I would do another review the scope of the project before getting started on implementation. I understand there would still be cuts and changes during development. I just should have done some extra technical implementation research for some of the features I had planned.

Coding:
- There are some files that I don't think need to be separate files and could have their contents merged into other existing files or into a combined file. One example of this is the files in the frontend/src/api file location. This is low priority right now but I may come back and fix it in the future.
- I think that I wouldn't use Tailwind. It was good to use it as a learning experiene and great for prototyping of the layout. It's not that Tailwind is bad, I just would prefer to use normal CSS.
- I don't know if I would make a different choice but I would do a deeper look at other backend options that aren't node/hono. For instance, I have heard good things about using C# and Dotnet for that side of things.

## Future Plans And Desires For The Project
There are many things that I would like to do in the future to improve and iterate on this project. Some of them are things that I needed to cut or ran out of time to implement for the current version; others are things that I would like to do for completely new versions of the project.

Here are some of the things I have in mind:

For this project:
- Change toast notifications to be a list to allow more than one showing at once.
- Make a light mode color scheme option.
- Improve dark mode color scheme.
- Client-side form validation.
- Lazy loading of game collections.
- A way to delete unused game cover art images.

For future versions of the project:
- Make another web version that doesn't need a separate backend server process. This would be done by using a technology to do everything for storage client-side such as SQLite-WASM.
- Make a native desktop app.
- Make a wishlist feature with price tracking for storefronts with available APIs.