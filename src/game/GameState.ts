import {
	Tile,
} from "./Tile"

export {
	GameState,
	getInitialGameState
}

type GameState = {
	over: boolean;
	tiles: Tile[];
}

function getInitialGameState(): GameState {
	return {
		over: false,
		tiles: [],
	}
}


