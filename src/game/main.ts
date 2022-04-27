import {
	GameState,
	getInitialGameState,
    isSame,
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
	const gameQueue = newGameQueue()();
	//so the canvas gets keyboard events
	canvas.tabIndex = -1;
	canvas.focus();
	gameQueue.setupCallbacks(canvas);
	const gameHolder = { game: getInitialGameState() };
	//@ts-ignore
	window.game = gameHolder;
	const gameRenderer = newGameRenderer();
	const gameClock = setInterval(
		() => {
			gameHolder.game = runGame(gameHolder.game, gameRenderer, gameQueue);
			if (gameHolder.game.over) {
				clearInterval(gameClock);
				gameQueue.teardownCallbacks(canvas);
			}
		},
		1000,
	);
	//TODO this forces the game to stop after 30 seconds
	setTimeout(() => clearInterval(gameClock), 30000);
	//gameQueue.teardownCallbacks(canvas);
}

function runGame(
	prevGameState: GameState,
	gameRenderer: GameRenderer,
	gameQueue: GameQueue,
): GameState {
	if (prevGameState.over) {
		return prevGameState;
	}
	const newEvents = gameQueue.getEvents();
	console.log(`events:`, newEvents);
	const newGameState = Object.assign({}, prevGameState);
	const keyEvents = newEvents.filter(newEvent => newEvent instanceof KeyboardEvent) as KeyboardEvent[];
	newGameState.keyStrokes = keyEvents.map(keyEvent => keyEvent.key);
	if (!isSame(prevGameState, newGameState)) {
		gameRenderer.render(Object.assign({}, newGameState));
	}
	return newGameState;
}
