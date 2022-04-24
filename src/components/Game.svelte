<script lang="ts">
import GameView from "./GameView.svelte";
import Menu from "./Menu.svelte";

import { startGame } from "../game/main.ts"

startGame();
</script>

<main>
<GameView class="GameView fill"/>
<Menu class="Menu fill" id="menu"/>
</main>

<style>
/* TODO how do I share this across the codebase?*/
.fill {
	width: 100%;
	height: 100%;
}
main {
	position: relative;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 255, 0, 0.25);
	border: solid 1px black;
	border-radius: 6px;
}
</style>
