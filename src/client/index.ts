import { Application, BitmapFont, Graphics, Ticker } from "pixi.js";
import { NetworkManager } from "./Networking/NetworkManager";
import { SceneManager } from "./Scenes/SceneManager";
import { io } from "socket.io-client";
import { MainScene } from "./Scenes/MainScene";
import { GameParameters as Params } from "./Utils/GameParameters";
import MenuScene from "./Scenes/Menus/MenuScene";

// @ts-ignore
import map from "./Assets/europe.svg";
import MapBuilder from "./Utils/MapBuilder";

// Game stuff
BitmapFont.from("TroopCountFont", {
	fontFamily: "Arial",
	fontSize: 40,
	fill: 0xffffff
}, { chars: [['a', 'z'], ['0', '9'], ['A', 'Z'], ' \\|/.-^%$&*()!?']});

const appParams = {
	view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	backgroundColor: Params.backgroundColor,
	width: Params.width,
	height: Params.height,
};

class App {
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
		//this.beginConnection();

		this.startGame();
	}
}

const app: App = new App(appParams);
app.start();

//const gameMap = (new MapBuilder(map)).buildMap();