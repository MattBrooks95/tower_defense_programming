import App from './components/App.svelte';

import { startGame } from './game/main';

const app = new App({
	target: document.body,
	props: {
		"startGameCallback": startGame,
	},
});

export default app;
