import { Box3, BoxGeometry, BufferGeometry, Color, DoubleSide, EdgesGeometry, Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D, OrthographicCamera, Scene, Vector3, WebGLRenderer } from "three";
import { GameState } from "./GameState";

export {
	GameRenderer,
	render,
	init
}

type GameRenderer = (gameState: GameState) => void;

////TODO actually make this a function and not an object with extra steps
////TODO render the game state
//function newGameRenderer() {
//	return {
//		//TODO requestAnimationFrame
//		render: (state: GameState) => console.log('TODO render', state),
//	}
//}

//const materialCache = () => {
//	const materials: Map<string, Material> = {};
//	return (materialCode: string) => {
//		let material = materials.get(materialCode);
//		if (!(material instanceof Material)) {
//			return material;
//		} else {
//		}
//
//	}
//
//}

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

const tileWidth = 50;
const tileHeight = 50;

const tileGeometry = new BoxGeometry(tileWidth, tileHeight);
const tileEdgesGeometry = new EdgesGeometry(tileGeometry);

const edgeLinesMaterial = new LineBasicMaterial({ color: colors.black });

const depths = {
	ground: 0,
	debugEdgelines: 0.4,
	debugAxisLines: 0.5,
};

const debugAxisZ = depths.debugAxisLines;
const debugAxisPoints = [
	new Vector3(-1000, 0, debugAxisZ),
	new Vector3(1000, 0, debugAxisZ),
	new Vector3(0, 1000, debugAxisZ),
	new Vector3(0, -1000, debugAxisZ),
	new Vector3(-0.05, -0.05, debugAxisZ),
	new Vector3(0.05, 0.05, debugAxisZ),
];
const debugLinesMaterial = new LineBasicMaterial({color: colors.red})
const debugLinesGeometry = new BufferGeometry().setFromPoints(debugAxisPoints);


let scene: Scene;
let camera: OrthographicCamera;
let cameraAreaSet = false;
let renderer: WebGLRenderer;

function init(canvas: HTMLCanvasElement): {
	renderer: WebGLRenderer;
	scene: Scene;
	camera: OrthographicCamera;
} {
	renderer = new WebGLRenderer({
		canvas,
	});

	//TODO this seems unnecessary
	//renderer.setSize(canvas.width, canvas.height);

	renderer.setClearColor(new Color(0.2, 0.2, 0.2), 1);
	camera = new OrthographicCamera();
	scene = new Scene();

	return {
		renderer,
		camera,
		scene,
	}
}

//if I don't plan on having tiles change during runtime
//should probably just make them once and leave them in the scene
function render(gameState: GameState): void {
	const [numTilesWidth, numTilesHeight] = gameState.level.boardSize;
	const width = numTilesWidth * tileWidth;
	const height = numTilesHeight * tileHeight;
	const tilesContainer: Group = new Group();

	const startPlacingPoint = new Vector3(-width / 2, height / 2);
	console.log({startPlacingPoint});

	for(let tileIndex = 0, numTiles = numTilesWidth * numTilesHeight; tileIndex < numTiles; tileIndex++) {
		const tile = new Mesh(tileGeometry, tileMaterial);
		if (isDev) {
			const edgeLines = new LineSegments(tileEdgesGeometry, edgeLinesMaterial);
			edgeLines.name = "debug_edgelines";
			edgeLines.position.z = depths.debugEdgelines;
			tile.add(edgeLines);
		}
		tilesContainer.add(tile);
	}

	tilesContainer.children.forEach((tile: Object3D, index: number) => {
		tile.position.set(
			startPlacingPoint.x + (tileWidth * 0.5) * (index % numTilesWidth + 1),
			startPlacingPoint.y - (tileHeight * 0.5) * (index % numTilesHeight + 1),
			depths.ground
		);
		tile.position.set(
			10,
			10,
			depths.ground
		);
		tile.matrixWorldNeedsUpdate = true;
	});
	
	const tileArea = new Box3().setFromObject(tilesContainer);
	const tileAreaCenter = new Vector3();
	tileArea.getCenter(tileAreaCenter);
	const tileAreaWidth = tileArea.max.x - tileArea.min.x;
	const halfTileAreaWidth = tileAreaWidth / 2;
	const tileAreaHeight = tileArea.max.y - tileArea.min.y;
	const halfTileAreaHeight = tileAreaHeight / 2;

	scene.remove(...scene.children);
	scene.add(tilesContainer);
	if (isDev) {
		scene.add(new LineSegments(
			debugLinesGeometry,
			debugLinesMaterial,
		));
	}
	if (!cameraAreaSet) {
		camera.position.copy(new Vector3(0, 0, 1));
		camera.left = tileArea.min.x;
		camera.right = tileArea.max.x;
		camera.top = tileArea.max.y;
		camera.bottom = tileArea.min.y;
		//camera.left = -halfTileAreaWidth;
		//camera.right = halfTileAreaWidth;
		//camera.top = halfTileAreaHeight;
		//camera.bottom = -halfTileAreaWidth;
		camera.updateMatrixWorld();
		camera.updateMatrix();//TODO which of these do I need
		cameraAreaSet = true;
	}
	requestAnimationFrame(() => {
		renderer.render(scene, camera);
		//console.log(`render count:${gameState.renderCount}`, {
		//	renderer,
		//	camera
		//});
	});
}

