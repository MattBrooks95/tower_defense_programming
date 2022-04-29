//this file needs to be considered a module to work apparently
export {}

declare global {
	interface Window {
		game?: Object;
	}
	var isDev: boolean;
}
