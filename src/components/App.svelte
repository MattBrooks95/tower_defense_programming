<script lang="ts">
//import Game from "./Game.svelte";

//let startGameCallback: Function | undefined = undefined;
const { startGameCallback } = $$props;
//console.log('props:', $$props);
console.log(startGameCallback);
</script>

<main class="container bb">
	<!--<Game></Game>-->
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
</style>
