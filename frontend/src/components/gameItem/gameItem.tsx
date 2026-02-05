// Work-in-progress GameItem component for displaying games and their stored info from the database.

import Btn from '../../components/common/btn.tsx';
import { BtnStyle } from '../../components/common/btn.tsx';

import type { Key } from "react";
import type { GameObject } from "../../interfaces/gameObjectInterface.ts";

interface GameItemProps {
	key: Key, // Should be the GameId.
	data: GameObject,
	editFunction: () => void,
	deleteFunction: () => void,
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
				max-md:h-56 min-md:h-fit max-sm:self-center" 
				src={imgSrc} alt={imgAlt}/>
				<div className="grow flex flex-col gap-0.25">
					<h2 className="text-2xl">{game.Title}</h2>
					<p className="text-pretty">{game.Description}</p>
				</div>
				<div id="gameActionButtons" className="flex md:flex-col gap-2 place-content-center md:basis-32">
					<Btn func={props.editFunction} className="max-md:grow md:w-32" style={BtnStyle.Neutral}>Edit</Btn>
					<Btn func={props.deleteFunction} className="max-md:grow md:w-32" style={BtnStyle.Danger}>Delete</Btn>
				</div>
			</div>

			{/* Div for game metadata */}
			<div id="extraGameInfoContainer" className="flex">
				{/* Placeholder. Right here should have things like the developer, publisher, release date, and genres once that stuff is properly being retrieved from the database. */}
			</div>
			
		</article>
	);
}