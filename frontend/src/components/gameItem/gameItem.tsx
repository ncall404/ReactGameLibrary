// Work-in-progress GameItem component for displaying games and their stored info from the database.

import type { Key } from "react";
import type { GameObject } from "../../interfaces/gameObjectInterface.ts";

interface GameItemProps {
	key: Key, // Should be the GameId.
	data: GameObject,
}

export default function GameItem(props: GameItemProps) {
	const game = props.data;

	let imgSrc = "";
	let imgAlt = "";
	if (game.CoverArt !== null) {
		imgSrc = `http://localhost:3000/${game.CoverArt}`;
		imgAlt = `Game cover art for ${game.Title}`;
	}

	return (
		<article className="flex flex-col gap-2 my-3 p-4 bg-(--color-darker)">
			{/* Div for main game information */}
			<div className="flex max-md:flex-col max-md:gap-2 gap-4">
				<img className="motion-safe:transition-all ease-in-out
				min-md:w-56 lg:w-64 max-md:w-fit
				max-md:h-56 min-md:h-fit" 
				src={imgSrc} alt={imgAlt}/>
				<div className="grow flex flex-col gap-0.25">
					<h2 className="text-2xl">{game.Title}</h2>
					<p className="text-pretty">{game.Description}</p>
				</div>
			</div>

			{/* Div for game metadata */}
			<div id="extraGameInfoContainer" className="flex">
				{/* Placeholder. Right here should have things like the developer, publisher, release date, and genres once that stuff is properly being retrieved from the database. */}
			</div>
			
		</article>
	);
}