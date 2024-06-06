import { Application, BitmapFont, Graphics, Ticker } from "pixi.js";
import { GameParameters as Params } from "../shared/Utils/GameParameters";
import App from "./App";

// Game stuff
BitmapFont.from("TroopCountFont", {
	fontFamily: "Arial",
	fontSize: 40,
	fill: 0xffffff
}, { chars: [['a', 'z'], ['0', '9'], ['A', 'Z'], ' \\|/.-^%$&*()!?:']});

const appParams = {
	view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	backgroundColor: Params.backgroundColor,
	width: Params.width,
	height: Params.height,
};

const app: App = new App(appParams);
app.start();