import { BitmapText, Graphics } from "pixi.js";
import { Scene } from "../Scene";
import { Button, ButtonContainer } from "@pixi/ui";
import { GameParameters as Params } from "../../Utils/GameParameters";
import { MainScene } from "../MainScene";
import { StylizedButton, StylizedText } from "../../UI/UI";
import NewGameMenuScene from "./NewGameMenuScene";

export default class MenuScene extends Scene {
    title: BitmapText;
    constructor() {
        super();

        // UI
        // Title
        this.title = new StylizedText("Statium", 35, 0x555555, Params.width/2, 75);
        this.addChild(this.title);

        // Buttons
        this.addChild(
            new StylizedButton(
                "Start new game",
                Params.width/2, Params.height/3,
                220, 50,
                this.startNewGame.bind(this)
            )
        );

        this.addChild(
            new StylizedButton(
                "Join existing game",
                Params.width/2, Params.height/3 + 80,
                250, 50,
                this.joinExistingGame.bind(this)
            )
        );
    }

    startNewGame() {
        console.log("Starting new game");
        this.sceneManager?.setScene(new NewGameMenuScene());
    }

    joinExistingGame() {
        console.log("Joining exisiting game");
    }
}