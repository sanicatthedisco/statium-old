import { Application, BitmapFont, Graphics, Ticker } from "pixi.js";
import { NetworkManager } from "./Networking/NetworkManager";
import { SceneManager } from "./Scenes/SceneManager";
import { io } from "socket.io-client";
import { MainScene } from "./Scenes/MainScene";

// Initialize connection to server
const nm: NetworkManager = new NetworkManager();

// Game stuff
BitmapFont.from("TroopCountFont", {
	fontFamily: "Arial",
	fontSize: 40,
	fill: 0xffffff
})

const app = new Application<HTMLCanvasElement>({
	view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	backgroundColor: "#eee",
	width: 640,
	height: 480
});

const sm: SceneManager = new SceneManager(app.stage, nm);
const main: MainScene = new MainScene();
sm.setScene(main);

Ticker.shared.add((deltaTime: number) => {
	sm.update(deltaTime);
});

console.log("test");