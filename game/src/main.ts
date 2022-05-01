import {
    Direction,
    Enemy,
	GameState,
	getInitialGameState,
    isSame,
} from "./GameState";

import {
	init as initRenderer,
	render,
	GameRenderer,
} from "./GameRenderer"

import {
	GameQueue,
	newGameQueue,
} from "./GameQueue"
import * as level from "../data/level.json";
import { Level } from "../data/level";

export {
	startGame,
}


function startGame(canvas: HTMLCanvasElement, onGameEnd: () => void) {
	console.log("TS game, canvas:", canvas);
	const gameQueue = newGameQueue()();
	//so the canvas gets keyboard events
	canvas.tabIndex = -1;
	gameQueue.setupCallbacks(canvas);
	const { camera, renderer, scene } = initRenderer(canvas);
	canvas.focus();
	const gameHolder = { game: getInitialGameState(getLevel()) };
	if (isDev) {
		window.gameHolder = gameHolder;
		window.graphics = {
			camera,
			renderer,
			scene
		}
	}
	const gameClock = setInterval(
		() => {
			gameHolder.game = runGame(gameHolder.game, render, gameQueue);
			//console.log({
			//	currentTick: gameHolder.game.currentTick,
			//	renderCount: gameHolder.game.renderCount
			//});
			if (gameHolder.game.over) {
				clearInterval(gameClock);
				gameQueue.teardownCallbacks(canvas);
				console.log('game over');
				onGameEnd && onGameEnd();
			}
		},
		8,
	);
}

function getLevel(): Level {
	return level as Level;
}

function canProcessKey(key: string) {
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
	//const newGameStateAttributes = getInitialGameState(prevGameState.level);
	const newGameState: GameState = Object.assign({}, prevGameState);

	const { keyboardEvents } = filterEvents(gameQueue.getEvents());

	handleKeyboardEvents(newGameState, keyboardEvents);
	simulate(prevGameState, newGameState);

	console.log({
		prevGameState,
		newGameState,
	});

	if (prevGameState.renderCount == 0 || !isSame(prevGameState, newGameState)) {
		gameRenderer(newGameState);
		newGameState.renderCount++;
	}

	return newGameState;
}

function filterEvents(newEvents: Event[]): { keyboardEvents: KeyboardEvent[] } {
	const keyboardEvents = newEvents.filter(newEvent => newEvent instanceof KeyboardEvent) as KeyboardEvent[];

	return {
		keyboardEvents,
	}
}

function simulate(prevGameState: GameState, nextGameState: GameState): void {
	const newEnemies: Enemy[] = [];
	if (prevGameState.level.enemies.count > 0  && prevGameState.currentTick % prevGameState.level.enemies.spawnRate) {
		newEnemies.push({
			position: [0, 0],//TODO figure out world units
			speed: prevGameState.level.enemies.speed,
			direction: prevGameState.level.enemies.direction === "right" ? Direction.Right : Direction.Left,
		});
		nextGameState.level.enemies.count = prevGameState.level.enemies.count - 1;
	}
	//move the enemies for this tick
	const currentEnemies = prevGameState.enemies.map(enemy => {
		//TODO
		return enemy;
	});
	//add the new enemies, if any, to the enemies list
	//after processing the ones that were already there
	nextGameState.enemies = currentEnemies.concat(newEnemies)
	nextGameState.currentTick++;
}

function handleKeyboardEvents(
	newGameState: GameState,
	keyboardEvents: KeyboardEvent[],
): void {
	const processableKeyboardEvents = keyboardEvents.filter(keyEvent => canProcessKey(keyEvent.key));
	if (processableKeyboardEvents.length > 0) {
		newGameState.over = true;
	}
}
