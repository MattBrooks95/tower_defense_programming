export {
	GameQueue,
	newGameQueue,
}

type GameQueue = {
	setupCallbacks: (targetElement: HTMLElement) => void;
	teardownCallbacks: (targetElement: HTMLElement) => void;
}

function newGameQueue(): GameQueue {
	const keyDown = (event: KeyboardEvent) => {
		console.log(`key event:${event.key}`);
	}
	return {
		setupCallbacks: (targetElement: HTMLElement) => {
			targetElement.addEventListener("keydown", keyDown);
		},
		teardownCallbacks: (targetElement: HTMLElement) => {
			targetElement.removeEventListener("keydown", keyDown);
		},
	}
}
