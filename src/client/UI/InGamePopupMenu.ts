import { Container, Graphics } from "pixi.js";
import { StylizedButton } from "./UI";
import { GameParameters as Params } from "../Utils/GameParameters";

export default class InGamePopupMenu extends Container {
    isOpen = false;

    constructor() {
        super();
        
        this.addChild(this.buildOpenButton());
    }

    buildOpenButton(): StylizedButton {
        const width = 30;
        const height = 30;
        const marginx = -10;
        const marginy = 20;

        const button = new StylizedButton(null, 
            Params.width - width - marginx, marginy, 
            width, height,
            () => {
                this.open();
            }
        );

        // Hamburger graphics
        const hColor = 0xeeeeee;
        const hMargin = 4;
        const hHeight = 4;
        const hRad = 3;

        for (let i = 0; i < 3; i ++) {
            let gr = new Graphics();
            gr.beginFill(hColor);
            gr.drawRoundedRect(-width/2 + hMargin, 
                -height/2 + hMargin + ((hHeight + hMargin) * i), 
                width - (hMargin*2), hHeight, hRad);
            gr.endFill();

            button.addChild(gr);
        }

        return button;
    }

    open() {

    }
}