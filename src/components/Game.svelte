<script lang="ts">
import GameView from "./GameView.svelte";
import Menu from "./Menu.svelte";

import { startGame } from "../game/main.ts"

let canvas = undefined;
let menuContainer = undefined;

let gameStarted = false;

const startGameCallback = () => {
	startGame(canvas, () => gameStarted = false);
	gameStarted = true;
}
</script>

<main>
<GameView class="GameView fill" bind:canvas/>
{#if !gameStarted}
<Menu
	class="Menu fill"
	id="menu"
	startGameCallback={startGameCallback}
	bind:menuContainer/>
{/if}
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
