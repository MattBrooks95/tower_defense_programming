<script lang="ts">
import Game from "./Game.svelte";
</script>

<main class="container bb">
	<Game class="contents"></Game>
</main>

<style>
main.container {
	width: 100%;
	height: 100%;
	background-color: rgba(255, 0, 0, 0.25);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 4px;
	overflow: hidden;
}

.bb {
	box-sizing: border-box;
}

.contents {
	background-color: yellow;
}
</style>
