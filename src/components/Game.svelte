<script lang="ts">
import GameView from "./GameView.svelte";
import Menu from "./Menu.svelte";

import { startGame } from "../game/main.ts"

const startGameCallback = () => {
	startGame(canvas);
}

let canvas = undefined;
</script>

<main>
<GameView class="GameView fill" bind:canvas/>
<Menu
	class="Menu fill"
	id="menu"
	startGameCallback={startGameCallback}/>
</main>

<style>
main {
	position: relative;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 255, 0, 0.25);
	border: solid 1px black;
	border-radius: 6px;
}
</style>
