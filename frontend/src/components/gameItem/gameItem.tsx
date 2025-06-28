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
		const mimeType = "image/png"; // TODO: determine what to do with this, image types could be multiple kinds...

		// imgSrc = URL.createObjectURL(game.CoverArt);
		imgSrc = `data:${mimeType};base64,${game.CoverArt}`;
		imgAlt = `Game Cover Art for ${game.Title}.`;
	} else {
		imgSrc = "../../assets/PlaceHolderCoverArtSize2.png";
		imgAlt = "Placeholder for game cover art as there was no art found in the database."
	}

	return (
		<article className="grid auto-cols-auto auto-rows-auto my-3 p-4 bg-(--color-darker)">
			{
			<img className="motion-safe:transition-all ease-in-out w-40 py-4 max-sm:order-2
			sm:row-span-3 sm:col-span-1 sm:w-40
			lg:w-64
			" src={imgSrc} alt={imgAlt}/>
			}
			<h2 className="text-2xl max-sm:order-1 sm:col-start-2 sm:col-span-2">{game.Title}</h2>
			<p className="max-sm:order-3 sm:col-span-2">{game.Description}</p>

			<div id="extraGameInfoContainer" className="flex">
				{/* Right here should have things like the developer, publisher, release date, and genres */}
			</div>
			
		</article>
	);
}