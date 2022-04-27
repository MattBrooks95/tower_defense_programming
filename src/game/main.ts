import {
	GameState,
	getInitialGameState,
} from "./GameState";

import {
	GameRenderer,
	newGameRenderer,
} from "./GameRenderer"

import {
	GameQueue,
	newGameQueue,
} from "./GameQueue"

export {
	startGame,
}

function startGame(canvas: HTMLCanvasElement) {
	console.log("TS game, canvas:", canvas);
	const gameQueue = newGameQueue();
	gameQueue.setupCallbacks();
	const gameRenderer = newGameRenderer();
	runGame(getInitialGameState(), gameRenderer, gameQueue);
	gameQueue.teardownCallbacks();
}

function runGame(
	gameState: GameState,
	gameRenderer: GameRenderer,
	gameQueue: GameQueue,
): GameState {
	if (gameState.over) {
		return gameState;
	}
}
