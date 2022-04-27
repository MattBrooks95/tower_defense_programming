export {
	GameQueue,
	newGameQueue,
}

type GameQueue = {
	setupCallbacks: () => void;
	teardownCallbacks: () => void;
}

function newGameQueue(): GameQueue {
	return {
		setupCallbacks: () => console.log("TODO"),
		teardownCallbacks: () => console.log("TODO"),
	}
}
