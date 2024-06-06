import { Application, Ticker } from "pixi.js";
import { NetworkManager } from "./Networking/NetworkManager";
import MenuScene from "./Scenes/Menus/MenuScene";
import { SceneManager } from "./Scenes/SceneManager";

export default class App {
	networkManager: NetworkManager;
	sceneManager: SceneManager;
	app: Application;

	constructor(params: any) {
		this.app = new Application<HTMLCanvasElement>(params);

		this.networkManager = new NetworkManager();
		this.sceneManager = new SceneManager(this.app.stage, this.networkManager);
	}

	beginConnection() {
		this.networkManager.initServerConnection();
	}

	startGame() {
		this.sceneManager.setScene(new MenuScene());

		Ticker.shared.add((deltaTime: number) => {
			this.sceneManager.update(deltaTime);
		});
	}

	start() {
		this.beginConnection();
		this.startGame();
	}
}