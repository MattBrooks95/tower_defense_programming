export type Level = {
	boardSize: [number, number];
	enemies: {
		spawn: [number, number];
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
