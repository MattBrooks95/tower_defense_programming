import { Box3, BoxGeometry, BufferGeometry, CircleBufferGeometry, Color, DoubleSide, EdgesGeometry, Group, LineBasicMaterial, LineSegments, Material, Mesh, MeshBasicMaterial, Object3D, OrthographicCamera, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import { GameState } from "./GameState";
import { BoardCoordinates, GameDepths } from "./main";

export {
	GameRenderer,
	render,
	init
}

type GameRenderer = (
	gameState: GameState,
	firstRender: boolean,
	boardPositions: BoardCoordinates,
	depths: Object
) => void;

const colors = {
	green: new Color(0, 1, 0),
	black: new Color(0, 0, 0),
	red: new Color(1, 0, 0),
};

//const objectCache: {[index: string], Object} = {};
const tileMaterial = new MeshBasicMaterial({
	color: colors.green,
	side: DoubleSide,
});

const geometries: Map<string, BufferGeometry> = new Map();
enum GeometryId {
	tileEdge = "tileEdge",
	tile = "tile",
}
const getGeometry: (key: string) => BufferGeometry = (key) => {
	const geometry = geometries.get(key);
	if (geometry === undefined) {
		throw new Error(`geometry lookup failed`);
	}
	return geometry;
}

//const tileGeometry = new BoxGeometry(tileWidth, tileHeight);

const enemyRadius = 50;
const enemyGeometry = new CircleBufferGeometry(enemyRadius, 16);
const enemyMaterial = new MeshBasicMaterial({
	color: colors.red
});

//const edgeLinesMaterial = new LineBasicMaterial({ color: colors.black });

//const debugAxisZ = depths.debugAxisLines;
//const debugAxisPoints = [
//	new Vector3(-1000, 0, debugAxisZ),
//	new Vector3(1000, 0, debugAxisZ),
//	new Vector3(0, 1000, debugAxisZ),
//	new Vector3(0, -1000, debugAxisZ),
//	//for debugging world coords
//	new Vector3(-0.05, -0.05, debugAxisZ),
//	new Vector3(0.05, 0.05, debugAxisZ),
//	new Vector3(0.0, 0.0, debugAxisZ),
//	new Vector3(0.0, 0.1, debugAxisZ),
//	new Vector3(0.0, 0.1, debugAxisZ),
//	new Vector3(0.1, 0.1, debugAxisZ),
//	new Vector3(0.1, 0.1, debugAxisZ),
//	new Vector3(0.1, 0.0, debugAxisZ),
//	new Vector3(0.1, 0.0, debugAxisZ),
//	new Vector3(0.0, 0.0, debugAxisZ),
//];
//const debugLinesMaterial = new LineBasicMaterial({color: colors.red})
//const debugLinesGeometry = new BufferGeometry().setFromPoints(debugAxisPoints);


let scene: Scene;
let camera: OrthographicCamera;
let renderer: WebGLRenderer;

function init(canvas: HTMLCanvasElement): {
	renderer: WebGLRenderer;
	scene: Scene;
	camera: OrthographicCamera;
} {
	renderer = new WebGLRenderer({
		canvas,
	});

	renderer.setClearColor(new Color(0.2, 0.2, 0.2), 1);
	camera = new OrthographicCamera();
	scene = new Scene();

	return {
		renderer,
		camera,
		scene,
	}
}

function makeTiles(
	numTilesWidth: number,
	numTilesHeight: number,
	tileGeometry: BufferGeometry,
	tileMaterial: Material,
): Object3D {
	const tilesContainer: Group = new Group();
	tilesContainer.name = "tile_container";
	for(let tileIndex = 0, numTiles = numTilesWidth * numTilesHeight; tileIndex < numTiles; tileIndex++) {
		const tile = new Mesh(tileGeometry, tileMaterial);
		//if (isDev) {
		//	const edgeLines = new LineSegments(getGeometry(GeometryId.tileEdge), edgeLinesMaterial);
		//	edgeLines.name = "debug_edgelines";
		//	edgeLines.position.z = depths.debugEdgelines;
		//	tile.add(edgeLines);
		//}
		tilesContainer.add(tile);
	}

	return tilesContainer;
}



//if I don't plan on having tiles change during runtime
//should probably just make them once and leave them in the scene
function render(
	gameState: GameState,
	firstRender: boolean,
	boardPositions: BoardCoordinates,
	depths: GameDepths,
): void {
	const [numTilesWidth, numTilesHeight] = gameState.level.board.size;
	const tileWidth = gameState.level.board.tileWidth;
	const tileHeight = gameState.level.board.tileHeight;
	const width = numTilesWidth * tileWidth;
	const height = numTilesHeight * tileHeight;
	//console.log(`board size: ${width}x${height}`);
	if (firstRender) {
		const tileGeometry = new BoxGeometry(tileWidth, tileHeight);
		geometries.set(GeometryId.tile, tileGeometry);
		geometries.set(GeometryId.tileEdge, new EdgesGeometry(tileGeometry));

		if (isDev) {
			const { escapeLimit } = boardPositions;
			console.log({ escapeLimit });
			const escapeLimitMesh = new LineSegments(
				new BufferGeometry().setFromPoints([
					new Vector3(escapeLimit.min.x, escapeLimit.min.y, depths.debugEdgeLines),
					new Vector3(escapeLimit.min.x, escapeLimit.max.y, depths.debugEdgeLines),

					new Vector3(escapeLimit.min.x, escapeLimit.max.y, depths.debugEdgeLines),
					new Vector3(escapeLimit.max.x, escapeLimit.max.y, depths.debugEdgeLines),

					new Vector3(escapeLimit.max.x, escapeLimit.max.y, depths.debugEdgeLines),
					new Vector3(escapeLimit.max.x, escapeLimit.min.y, depths.debugEdgeLines),

					new Vector3(escapeLimit.max.x, escapeLimit.min.y, depths.debugEdgeLines),
					new Vector3(escapeLimit.min.x, escapeLimit.min.y, depths.debugEdgeLines),
				]),
				new LineBasicMaterial({
					color: colors.red,
				})
			);
			escapeLimitMesh.name = "escapeLimit";
			scene.add(escapeLimitMesh);
		}

		const tilesContainer = makeTiles(numTilesWidth, numTilesHeight, getGeometry("tile"), tileMaterial);

		tilesContainer.children.forEach((tile: Object3D, index: number) => {
			const position = boardPositions.boardTileLocations[index];
			tile.position.copy(
				position
			);
			tile.matrixWorldNeedsUpdate = true;
			tile.updateMatrixWorld();
		});
		const enemies = new Group();
		enemies.name = "enemies";
		const towers = new Group();
		towers.name = "towers";
		scene.add(enemies, towers, tilesContainer);

		camera.position.copy(new Vector3(0, 0, 1));
		const padding = isDev ? 50 : 0;
		//console.log(`camera ratio: ${(tileArea.max.x - tileArea.min.x) / (tileArea.max.y - tileArea.min.y)}`, tileArea);
		camera.left = -width / 2 - padding;
		camera.right = width / 2 + padding;
		camera.top = height / 2 + padding;
		camera.bottom = -height / 2 - padding;

		camera.updateProjectionMatrix();
		camera.updateMatrixWorld();
	}

	const enemies = scene.getObjectByName("enemies");
	const towers = scene.getObjectByName("towers");
	if (enemies !== undefined) {
		enemies.remove(...enemies.children);
		const enemyObjects = gameState.enemies.map(enemy => {
			const enemyMesh = new Mesh(enemyGeometry, enemyMaterial) 
			enemyMesh.position.copy(enemy.position);
			enemyMesh.updateMatrixWorld();
			return enemyMesh;
		});
		enemies.add(...enemyObjects);
	}
	
	if (towers !== undefined) {
		towers.remove(...towers.children);
		//
	}

	//if (isDev) {
	//	const debugAxis = new LineSegments(
	//		debugLinesGeometry,
	//		debugLinesMaterial,
	//	);
	//	debugAxis.name = "debug_axis";
	//	scene.add(debugAxis);
	//}
	requestAnimationFrame(() => {
		renderer.render(scene, camera);
		//console.log(`render count:${gameState.renderCount}`, {
		//	renderer,
		//	camera
		//});
	});
}

