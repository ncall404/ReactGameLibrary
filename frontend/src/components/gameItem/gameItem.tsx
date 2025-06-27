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
		<article className="flex flex-col sm:flex-row my-3 p-4 bg-(--color-darker)">
			<img className="w-40" src={imgSrc} alt={imgAlt}/>
			<div id="gameInfoContainer">
				<div id="primaryGameInfoContainer" className="flex flex-col sm:mx-5">
					<h2 className="text-2xl">{game.Title}</h2>
					<p className="">{game.Description}</p>
				</div>
				<div id="extraGameInfoContainer" className="flex">

				</div>
			</div>
			
		</article>
	);
}