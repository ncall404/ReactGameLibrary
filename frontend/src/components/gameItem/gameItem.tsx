// Placeholder GameItem component

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
	} else {
		imgSrc = "./src/assets/PlaceHolderCoverArtSize2.png"; // TODO: Make a better placeholder image...
		imgAlt = "Placeholder for game cover art as there was no art found in the database.";
	}

	return (
		<article className="grid auto-cols-max auto-rows-max max-sm:auto-cols-auto sm:gap-x-4 gap-y-1 my-3 p-4 bg-(--color-darker)">
			{
			<img className="motion-safe:transition-all ease-in-out w-40 col-start-1 max-sm:order-2
			sm:row-span-3
			lg:w-64
			" src={imgSrc} alt={imgAlt}/>
			}
			<h2 className="text-2xl max-sm:order-1 sm:col-start-2 sm:col-span-2">{game.Title}</h2>
			<p className="max-sm:order-3">{game.Description}</p>

			<div id="extraGameInfoContainer" className="flex">
				{/* Placeholder. Right here should have things like the developer, publisher, release date, and genres once that stuff is properly being retrieved from the database. */}
			</div>
			
		</article>
	);
}