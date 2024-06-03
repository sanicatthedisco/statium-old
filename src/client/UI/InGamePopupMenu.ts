import { Container, Graphics } from "pixi.js";
import { StylizedButton } from "./UI";
import { GameParameters as Params } from "../Utils/GameParameters";
import { SceneManager } from "../Scenes/SceneManager";

export default class InGamePopupMenu extends Container {
    isOpen = false;

    openButton: StylizedButton;
    menuContainer: Container;
    sm: SceneManager;

    constructor(sm: SceneManager) {
        super();
        this.sm = sm;

        this.openButton = this.buildOpenButton();
        this.menuContainer = this.buildPopupMenu();
        this.addChild(this.openButton);

        this.zIndex = 2;
    }

    open() {
        this.removeChild(this.openButton);
        this.addChild(this.menuContainer);
    }

    close() {
        this.removeChild(this.menuContainer);
        this.addChild(this.openButton);
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

    buildPopupMenu(): Container {
        const color = 0xdddddd;
        const margin = 50;
        const container = new Container();
        const gr = new Graphics();
        gr.beginFill(color);
        gr.drawRoundedRect(margin, margin, 
                Params.width - margin*2, Params.height - margin*2, 5);
        gr.endFill();

        container.addChild(gr);
        
        container.addChild(
            new StylizedButton(
                "Return to game",
                Params.width/2,Params.height/2 - 50,
                300, 50,
                () => {
                    this.close();
                }
            )
        );

        container.addChild(
            new StylizedButton(
                "Leave game",
                Params.width/2,Params.height/2 + 50,
                300, 50,
                () => {
                    this.sm.leaveGame();
                }
            )
        );

        return container;
    }
}