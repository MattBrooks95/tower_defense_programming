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

import * as level from "../data/level";

import { Box2, Vector2, Vector3 } from "three";

export {
	startGame,
}

console.log('loaded level:', level);


function startGame(canvas: HTMLCanvasElement, onGameEnd: () => void) {
	console.log("TS game, canvas:", canvas);
	const gameQueue = newGameQueue()();
	//so the canvas gets keyboard events
	canvas.tabIndex = -1;
	gameQueue.setupCallbacks(canvas);
	const { camera, renderer, scene } = initRenderer(canvas);
	canvas.focus();
	//const gameHolder = { game: getInitialGameState(getLevel()) };
	const gameHolder = { game: getInitialGameState(level) };
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

//function getLevel(): Level {
//	return level as Level;
//}

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
		gameRenderer(newGameState, isFirstRender, boardPositions, depths);
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

export type GameDepths = {
	ground: number;
	entities: number;
	debugEdgeLines: number;
	debugAxisLines: number;
}

const depths: GameDepths = {
	ground: 0,
	entities: 0.6,
	debugEdgeLines: 0.4,
	debugAxisLines: 0.5,
};

export type BoardCoordinates = {
	boardWidth: number;
	boardHeight: number;
	boardTileLocations: Vector3[];
	/* if the enemies make it out of this space, the player loses life */
	escapeLimit: Box2;
};

function calculateBoardPositions(
	tileWidth: number,
	tileHeight: number,
	numTilesX: number,
	numTilesY: number,
): BoardCoordinates {
	const boardWidth = numTilesX * tileWidth;
	const halfBoardWidth = boardWidth / 2;
	const boardHeight = numTilesY * tileHeight;
	const halfBoardHeight = boardHeight / 2;

	const startPlacingPoint = new Vector3((-halfBoardWidth) + tileWidth / 2, (halfBoardHeight) - tileHeight / 2);
	//console.log('start point', {startPlacingPoint});
	const boardTileLocations = calculateTileLocations(
		tileWidth,
		tileHeight,
		numTilesX,
		numTilesY,
		depths.ground,
		startPlacingPoint,
	);

	const escapeLimit: Box2 = new Box2(
		new Vector2(-halfBoardWidth, -halfBoardHeight),
		new Vector2(halfBoardWidth, halfBoardHeight),
	);

	return {
		boardWidth,
		boardHeight,
		boardTileLocations,
		escapeLimit,
	}
}

function simulate(prevGameState: GameState, nextGameState: GameState, boardCoordinates: BoardCoordinates): void {
	//console.log({ prevGameState, nextGameState });
	const newEnemies: Enemy[] = [];
	const { boardTileLocations, escapeLimit } = boardCoordinates;
	if (prevGameState.level.enemies.count > 0  && prevGameState.currentTick % prevGameState.level.enemies.spawnRate === 0) {
		const spawnTile = prevGameState.level.enemies.spawn;
		newEnemies.push({
			position: boardTileLocations[spawnTile].clone().setZ(depths.entities),
			speed: prevGameState.level.enemies.speed,
			direction: prevGameState.level.enemies.direction === "right" ? Direction.Right : Direction.Left,
		});
		nextGameState.level.enemies.count = prevGameState.level.enemies.count - 1;
	}
	const numEnemiesStart = prevGameState.enemies.length;
	//filter out the enemies who were shot(TODO) or made it past the edge of the board
	let currentEnemies = prevGameState.enemies.filter(enemy => {
		const withinBounds = escapeLimit.containsPoint(new Vector2(enemy.position.x, enemy.position.y)); 
		//console.log(`enemy with pos:${enemy.position.x}x${enemy.position.y} escaped`, escapeLimit);
		return withinBounds;
	});
	const enemiesWhoEscaped = numEnemiesStart - currentEnemies.length;
	//move the enemies for this tick
	currentEnemies.forEach(enemy => {
		enemy.position.x += enemy.speed * nextGameState.level.board.tileWidth;
		return enemy;
	});
	nextGameState.level.player.hitpoints -= enemiesWhoEscaped;
	//console.log(`hitpoints:${nextGameState.level.player.hitpoints}`);
	if (nextGameState.level.player.hitpoints <= 0) {
		console.log('player lost due to escaped enemies');
		nextGameState.over = true;
	}
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
