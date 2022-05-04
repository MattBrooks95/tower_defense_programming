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
import { Vector3 } from "three";

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
	const boardPositions = calculateBoardPositions(
		prevGameState.level.board.tileWidth,
		prevGameState.level.board.tileHeight,
		prevGameState.level.board.size[0],
		prevGameState.level.board.size[1],
	);
	simulate(prevGameState, newGameState, boardPositions);

	//console.log({
	//	prevGameState,
	//	newGameState,
	//});

	const isFirstRender = prevGameState.renderCount == 0;
	if (isFirstRender || !isSame(prevGameState, newGameState)) {
		gameRenderer(newGameState, isFirstRender, boardPositions);
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

function calculateTileLocations(
	tileWidth: number,
	tileHeight: number,
	numTilesX: number,
	numTilesY: number,
	z: number,
	startPlacingPoint: Vector3 = new Vector3(0, 0, 0),
): Vector3[] {
	const positions = [];
	for(let tileIndex = 0, numTiles = numTilesX * numTilesY; tileIndex < numTiles; tileIndex++) {
		const xLoc = startPlacingPoint.x + tileWidth * (tileIndex % numTilesX);
		const yLoc = startPlacingPoint.y - tileHeight * (Math.floor(tileIndex / numTilesX)); 
		positions.push(new Vector3(xLoc, yLoc, z));

	}

	return positions;
}

const depths = {
	ground: 0,
	entities: 0.6,
	debugEdgelines: 0.4,
	debugAxisLines: 0.5,
};

export type BoardCoordinates = {
	boardWidth: number;
	boardHeight: number;
	boardTileLocations: Vector3[];
};

function calculateBoardPositions(
	tileWidth: number,
	tileHeight: number,
	numTilesX: number,
	numTilesY: number,
): BoardCoordinates {
	const boardWidth = numTilesX * tileWidth;
	const boardHeight = numTilesY * tileHeight;
	const startPlacingPoint = new Vector3((-boardWidth / 2) + tileWidth / 2, (boardHeight / 2) - tileHeight / 2);
	console.log('start point', {startPlacingPoint});
	const boardTileLocations = calculateTileLocations(
		tileWidth,
		tileHeight,
		numTilesX,
		numTilesY,
		depths.ground,
		startPlacingPoint,
	);

	return {
		boardWidth,
		boardHeight,
		boardTileLocations,
	}
}

function simulate(prevGameState: GameState, nextGameState: GameState, boardCoordinates: BoardCoordinates): void {
	const newEnemies: Enemy[] = [];
	const { boardTileLocations } = boardCoordinates;
	if (prevGameState.level.enemies.count > 0  && prevGameState.currentTick % prevGameState.level.enemies.spawnRate === 0) {
		const spawnTile = prevGameState.level.enemies.spawn;
		newEnemies.push({
			position: boardTileLocations[spawnTile].clone().setZ(depths.entities),
			speed: prevGameState.level.enemies.speed,
			direction: prevGameState.level.enemies.direction === "right" ? Direction.Right : Direction.Left,
		});
		nextGameState.level.enemies.count = prevGameState.level.enemies.count - 1;
	}
	//move the enemies for this tick
	const currentEnemies = prevGameState.enemies.map(enemy => {
		//TODO make sure this change in position is reflected
		enemy.position.x += enemy.speed * nextGameState.level.board.tileWidth;
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
