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

function isSame(state1: GameState, state2: GameState): boolean {
	return state1.over === state2.over
		&& state1.tiles.length === state2.tiles.length//TODO dummy check
		&& state1.keyStrokes.toString() === state2.keyStrokes.toString()
}

