// Work-in-progress GameItem component for displaying games and their stored info from the database.

import Btn from '../../components/common/btn.tsx';
import { BtnStyle } from '../../components/common/btn.tsx';

import type { Key } from "react";
import type { GameObject } from '../../routes/index.tsx';

type GameItemProps = {
	key: Key, // Should be the GameId.
	data: GameObject,
	editFunction: () => void,
	deleteFunction: () => void,
}

export default function GameItem(props: GameItemProps) {

	const game = props.data;

	let imgSrc = "";
	let imgAlt = "";
	if (game.gameData.CoverArt !== null) {
		imgSrc = `http://localhost:3000/${game.gameData.CoverArt}`;
		imgAlt = `Game cover art for ${game.gameData.Title}`;
	}


	// Converts an array of objects that have the layout of {Title: ""} to a string listing out all the titles in the array.
	function titlesToString(arr: Array<Record<string, string>>) {
		const titleArr: string[] = [];
		for (const obj of arr) {
			titleArr.push(obj.Title);
		}
		return titleArr.join(", ");
	}


	return (
		<article className="flex flex-col gap-2 my-3 py-3 px-2 sm:p-3 sm:rounded-sm bg-(--color-darker)">
			{/* Div for main game information */}
			<div className="flex max-md:flex-col max-md:gap-2 gap-4">
				<img className="motion-safe:transition-all ease-in-out
				min-md:w-56 lg:w-64 max-md:w-fit
				max-md:h-56 min-md:h-fit max-sm:self-center" 
				src={imgSrc} alt={imgAlt}/>
				<div className="grow flex flex-col gap-0.25">
					<h2 className="text-2xl">{game.gameData.Title}</h2>
					<p className="text-pretty mb-2">{game.gameData.Description}</p>
				</div>

				<div id="gameActionButtons" className="flex md:flex-col gap-2 place-content-center md:basis-32">
					<Btn func={props.editFunction} className=" w-1/2 md:w-32" style={BtnStyle.Neutral}>Edit</Btn>
					<Btn func={props.deleteFunction} className="w-1/2 md:w-32" style={BtnStyle.Danger}>Delete</Btn>
				</div>
			</div>

			{ /* More game details such as release date, genres, platforms, etc. */
				((game.publisherData && game.publisherData.length > 0) || (game.developerData && game.developerData.length > 0) || 
				(game.platformData && game.platformData.length > 0) || (game.storefrontData && game.storefrontData.length > 0) ||
				game.gameData.ReleaseDate) &&
				<details className="basis-full grow font-medium border-2 rounded-sm
					text-(--color-light) border-(--color-neutral)">
					<summary className="select-none cursor-pointer p-[5px] border-(--color-neutral) bg-(--color-btn-bg) hover:bg-(--color-neutral)"
					>Game Details</summary>
					<div className="p-1 pl-2 sm:pl-4">
						{
							game.gameData.ReleaseDate &&
							<p><span>Release:</span> {new Date(game.gameData.ReleaseDate * 1000).toLocaleDateString()}</p>
						}
						{
							game.publisherData && game.publisherData.length > 0 &&
							<p><span>Publishers:</span> {titlesToString(game.publisherData)}</p>
						}
						{
							game.developerData && game.developerData.length > 0 &&
							<p><span>Developers:</span> {titlesToString(game.developerData)}</p>
						}
						{
							game.platformData && game.platformData.length > 0 &&
							<p><span>Platforms:</span> {titlesToString(game.platformData)}</p>
						}
						{
							game.storefrontData && game.storefrontData.length > 0 &&
							<p><span>Storefronts:</span> {titlesToString(game.storefrontData)}</p>
						}
						{
							game.genreData && game.genreData.length > 0 &&
							<p><span>Genres:</span> {titlesToString(game.genreData)}</p>
						}
					</div>
					
				</details>
			}
				
			
			
		</article>
	);
}