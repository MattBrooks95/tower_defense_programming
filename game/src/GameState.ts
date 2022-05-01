import { Level } from "./data/level";
import {
	Tile,
} from "./Tile"

export {
	GameState,
	getInitialGameState,
	isSame
}

export enum Direction { Right, Left }

type Position = [number, number];

export type Enemy = {
	position: Position;
	speed: number;
	direction: Direction;
}

type Tower = {
	position: Position;
	fireRate: number;
}

type GameState = {
	over: boolean;
	tiles: Tile[];
	//dummy state to test event loop
	keyStrokes: string[];
	level: Level;
	enemies: Enemy[];
	towers: Tower[];
	currentTick: number;
	renderCount: number;
}

function getInitialGameState(level: Level): GameState {
	return {
		over: false,
		tiles: [],
		keyStrokes: [],
		level,
		enemies: [],
		towers: [],
		currentTick: 0,
		renderCount: 0,
	}
}

//because it's a simulation I think it will always be different anyway
function isSame(state1: GameState, state2: GameState): boolean {
	return false;
	//return state1.over === state2.over
	//	&& state1.enemies.length === state2.enemies.length
	//	&& state1.enemies.map(enemy => enemy.position)
	//	&& state1.keyStrokes.toString() === state2.keyStrokes.toString()
}
