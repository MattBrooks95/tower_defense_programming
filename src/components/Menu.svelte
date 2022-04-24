<script lang="ts">
import Button from "./elements/Button.svelte"

export let startGameCallback: () => void | undefined = undefined;
</script>

<div class="menu">
	<div class="list flexcol">
		<Button text={"Start Game"} onclick={startGameCallback}/>
	</div>
</div>

<style>
.flexcol {
	display: flex;
	flex-direction: column;
}

.menu {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	padding: 6px;
}

.list {
	justify-content: flex-start;
	align-items: center;
	gap: 6px;
}
</style>
