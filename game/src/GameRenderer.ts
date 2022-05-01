import { Box3, BoxGeometry, Group, Mesh, MeshBasicMaterial, Object3D, OrthographicCamera, Scene, Vector3, WebGLRenderer } from "three";
import { GameState } from "./GameState";

export {
	GameRenderer,
	//newGameRenderer,
	render,
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

});

const tileGeometry = new BoxGeometry();

export const scene = new Scene();
export const camera = new OrthographicCamera();
let cameraAreaSet = false;
export const renderer = new WebGLRenderer();

//if I don't plan on having tiles change during runtime
//should probably just make them once and leave them in the scene
function render(gameState: GameState): void {
	const tileWidth = 50;
	const tileHeight = 50;
	const [width, height] = gameState.level.boardSize;
	const tilesContainer: Group = new Group();

	for(let tileIndex = 0, numTiles = width * height; tileIndex < numTiles; tileIndex++) {
		tilesContainer.add(new Mesh(tileGeometry, tileMaterial));
	}
	tilesContainer.children.forEach((tile: Object3D, index: number) => {
		tile.position.set(
			(tileWidth * 0.5) * (index % width + 1),
			(tileHeight * 0.5) * (index % height + 1),
			0
		);
	});
	
	const tileArea = new Box3().setFromObject(tilesContainer);
	const tileAreaCenter = new Vector3();
	tileArea.getCenter(tileAreaCenter);

	scene.remove(...scene.children);
	scene.add(tilesContainer);
	if (!cameraAreaSet) {
		camera.position.copy(tileAreaCenter);
		camera.left = tileArea.min.x;
		camera.right = tileArea.max.x;
		camera.top = tileArea.max.y;
		camera.bottom = tileArea.min.y;
		camera.updateMatrixWorld();
		cameraAreaSet = true;
	}
	requestAnimationFrame(() => {
		renderer.render(scene, camera);
		console.log(`render count:${gameState.renderCount}`);
	});
}

