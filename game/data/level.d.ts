export type Level = {
	board: {
		size: [number, number],
		tileWidth: number;
		tileHeight: number;
	},
	enemies: {
		spawn: number;
		//in game ticks
		speed: number;
		direction: string;
		count: number;
		//in game ticks
		spawnRate: number;
	};
	towers: {
		position: [number, number];
		//in game ticks
		fireRate: number;
	}[];
}
