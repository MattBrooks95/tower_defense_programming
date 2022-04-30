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

function render(gameState: GameState): void {

}
