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
	gameQueue.setupCallbacks(canvas);
	canvas.focus();
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
				throw new Error('game over');
			}
		},
		8,
	);
	//TODO this forces the game to stop after 30 seconds
	setTimeout(() => clearInterval(gameClock), 30000);
	gameQueue.teardownCallbacks(canvas);
}

function canProcessEvent(key: string) {
	console.log('can process event:', { key });
	return key === 'Escape';
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
	const keyboardEvents = newEvents.filter(newEvent => newEvent instanceof KeyboardEvent) as KeyboardEvent[];
	const processableKeyboardEvents = keyboardEvents.filter(keyEvent => canProcessEvent(keyEvent.key));
	console.log(`processable:`, processableKeyboardEvents);
	const newGameStateAttributes = getInitialGameState();
	if (processableKeyboardEvents.length > 0) {
		newGameStateAttributes.over = true;
	}
	const newGameState = Object.assign({}, prevGameState, newGameStateAttributes);
	if (!isSame(prevGameState, newGameState)) {
		gameRenderer.render(Object.assign({}, newGameState));
	}
	return newGameState;
}
