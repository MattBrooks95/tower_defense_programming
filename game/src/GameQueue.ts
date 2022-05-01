export {
	GameQueue,
	newGameQueue,
}

type GameQueue = {
	setupCallbacks: (targetElement: HTMLElement) => void;
	teardownCallbacks: (targetElement: HTMLElement) => void;
	getEvents: () => Event[];
}

function newGameQueue(): () => GameQueue {
	const events: Event[] = [];
	const keyDown = (event: KeyboardEvent) => {
		console.log('game q', { event });
		events.push(event);
	}
	return function(){
		return {
			setupCallbacks: (targetElement: HTMLElement) => {
				targetElement.addEventListener("keydown", keyDown);
			},
			teardownCallbacks: (targetElement: HTMLElement) => {
				targetElement.removeEventListener("keydown", keyDown);
			},
			getEvents: () => {
				const eventsClone = [...events];
				//indiscriminately throwing these events away will not work
				//in most games
				//events.slice();
				return eventsClone;
			}
		}
	}
}
