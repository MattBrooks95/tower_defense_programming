//this file needs to be considered a module to work apparently
export {}

declare global {
	interface Window {
		gameHolder?: Object;
		graphics?: {
			camera: Camera;
			renderer: WebGLRenderer;
			scene: Scene;
		}
	}
	var isDev: boolean;
}
