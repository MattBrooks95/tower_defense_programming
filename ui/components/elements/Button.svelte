<script lang="ts">
export let text: string = "";
export let onclick: () => void | undefined = undefined;
</script>

<!--<button on:click={() => onclick && onclick()}>-->
<button on:click={() => onclick && onclick()}>
{text}
</button>
