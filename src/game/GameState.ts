import {
	Tile,
} from "./Tile"

export {
	GameState,
	getInitialGameState,
	isSame
}

type GameState = {
	over: boolean;
	tiles: Tile[];
	//dummy state to test event loop
	keyStrokes: string[];
}

function getInitialGameState(): GameState {
	return {
		over: false,
		tiles: [],
		keyStrokes: []
	}
}

function isSame(state1: GameState, state2: GameState): boolean {
	return state1.over === state2.over
		&& state1.tiles.length === state2.tiles.length//TODO dummy check
		&& state1.keyStrokes.toString() === state2.keyStrokes.toString()
}

