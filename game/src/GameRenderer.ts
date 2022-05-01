import { Box3, BoxGeometry, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, Object3D, OrthographicCamera, Scene, Vector3, WebGLRenderer } from "three";
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
//const objectCache: {[index: string], Object} = {};
const tileMaterial = new MeshBasicMaterial({
	color: new Color(0, 1, 0),
	side: DoubleSide,
});

const tileWidth = 50;
const tileHeight = 50;

const tileGeometry = new BoxGeometry(tileWidth, tileHeight);

let scene: Scene;// = new Scene();
let camera: OrthographicCamera;// = new OrthographicCamera();
let cameraAreaSet = false;
let renderer: WebGLRenderer;// = new WebGLRenderer();

function init(canvas: HTMLCanvasElement): {
	renderer: WebGLRenderer;
	scene: Scene;
	camera: OrthographicCamera;
} {
	renderer = new WebGLRenderer({
		canvas,
	});
	renderer.setClearColor(new Color(0.2, 0.2, 0.2), 0);
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

	for(let tileIndex = 0, numTiles = numTilesWidth * numTilesHeight; tileIndex < numTiles; tileIndex++) {
		tilesContainer.add(new Mesh(tileGeometry, tileMaterial));
	}

	tilesContainer.children.forEach((tile: Object3D, index: number) => {
		tile.position.set(
			startPlacingPoint.x + (tileWidth * 0.5) * (index % numTilesWidth + 1),
			startPlacingPoint.y - (tileHeight * 0.5) * (index % numTilesHeight + 1),
			0
		);
	});
	
	const tileArea = new Box3().setFromObject(tilesContainer);
	const tileAreaCenter = new Vector3();
	tileArea.getCenter(tileAreaCenter);

	scene.remove(...scene.children);
	scene.add(tilesContainer);
	if (!cameraAreaSet) {
		camera.position.copy(new Vector3(0, 0, -1));
		camera.left = tileArea.min.x;
		camera.right = tileArea.max.x;
		camera.top = tileArea.max.y;
		camera.bottom = tileArea.min.y;
		camera.updateMatrixWorld();
		camera.updateMatrix();//TODO which of these do I need
		cameraAreaSet = true;
	}
	requestAnimationFrame(() => {
		renderer.clearColor();
		renderer.render(scene, camera);
		console.log(`render count:${gameState.renderCount}`, {
			renderer,
			camera
		});
	});
}

