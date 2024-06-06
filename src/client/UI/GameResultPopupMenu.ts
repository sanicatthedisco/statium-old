import { Container, Graphics } from "pixi.js";
import { StylizedButton, StylizedText } from "./UI";
import { GameParameters as Params } from "../../shared/Utils/GameParameters";
import { SceneManager } from "../Scenes/SceneManager";
import MenuScene from "../Scenes/Menus/MenuScene";

export default class GameResultPopupMenu extends Container {
    sm: SceneManager;
    constructor(isWinner: boolean, sm: SceneManager) {
        super();
        this.sm = sm;

        this.zIndex = 2;

        let text: string;
        if (isWinner) text = "You win!";
        else text = "You lose :(";

        const color = Params.popupBackgroundColor;
        const margin = 100;
        const width = Params.width - margin * 2;
        const height = Params.height - margin * 2;
        const gr = new Graphics();
        gr.beginFill(color.hex());
        gr.drawRoundedRect(margin, margin, 
                width, height, 5);
        gr.endFill();
        this.addChild(gr);

        this.addChild(
            new StylizedText(
                text, 30, Params.titleColor,
                Params.width/2, Params.height * 0.3
            )
        );

        this.addChild(
            new StylizedButton(
                "Return to menu", 
                Params.width/2, Params.height * 0.6,
                300, 50,
                () => {
                    console.log("Clicked");
                    this.sm.leaveGame();
                }
            )
        );
        
    }
}