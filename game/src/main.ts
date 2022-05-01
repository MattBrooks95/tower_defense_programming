import {
    Direction,
    Enemy,
	GameState,
	getInitialGameState,
    isSame,
} from "./GameState";

import {
    camera,
	GameRenderer,
	render,
    renderer,
    scene,
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
	canvas.focus();
	const gameHolder = { game: getInitialGameState(getLevel()) };
	console.log(`isDev:${isDev}`);
	if (isDev) {
		window.game = gameHolder;
		window.graphics = {
			camera,
			renderer,
			scene
		}
	}
	const gameClock = setInterval(
		() => {
			gameHolder.game = runGame(gameHolder.game, render, gameQueue);
			if (gameHolder.game.over) {
				clearInterval(gameClock);
				gameQueue.teardownCallbacks(canvas);
				console.log('game over');
				onGameEnd();
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
	const newGameStateAttributes = getInitialGameState(prevGameState.level);

	const { keyboardEvents } = filterEvents(gameQueue.getEvents());

	handleKeyboardEvents(prevGameState, newGameStateAttributes, keyboardEvents);
	simulate(prevGameState, newGameStateAttributes);

	const newGameState = Object.assign({}, prevGameState, newGameStateAttributes);

	if (prevGameState.renderCount == 0 || !isSame(prevGameState, newGameState)) {
		gameRenderer(Object.assign({}, newGameState));
		newGameState.renderCount++;
	}

	newGameState.currentTick += 1;
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

}

function handleKeyboardEvents(
	prevGameState: GameState,
	newGameStateAttributes: GameState,
	keyboardEvents: KeyboardEvent[],
): void {
	const processableKeyboardEvents = keyboardEvents.filter(keyEvent => canProcessKey(keyEvent.key));
	if (processableKeyboardEvents.length > 0) {
		newGameStateAttributes.over = true;
	}
}
