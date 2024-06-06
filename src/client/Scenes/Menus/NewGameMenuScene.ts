import { Scene } from "../Scene";
import { GameParameters as Params } from "../../../shared/Utils/GameParameters";
import { StylizedButton, StylizedInputFactory, StylizedText } from "../../UI/UI";
import { Input } from "@pixi/ui";
import MenuScene from "./MenuScene";
import { MainScene } from "../MainScene";
import Color from "color";

export default class NewGameMenuScene extends Scene {
    input: Input;
    
    constructor() {
        super();

        this.addChild(
            new StylizedText(
                "Create new room", 35, Color(0x555555),
                Params.width/2, 100
            )
        );

        this.input = (new StylizedInputFactory()).buildInput("Enter a new room ID", Params.width/2, 200, 300, 50)
        this.addChild(this.input);

        this.addChild(
            new StylizedButton("Create",
                Params.width/2, 270,
                100, 50, 
                () => {
                    //TODO: sanitize
                    this.sceneManager?.networkManager.requestLobbyCreation(this.input.value);
                }
            )
        );

        this.addChild(
            new StylizedButton("Back",
                Params.width/2, 330,
                100, 50,
                () => {
                    this.sceneManager?.setScene(new MenuScene());
                }
            )
        );
    }

    fail() {
        this.addChild(
            new StylizedText("A room with this name already exists",
                20, Color(0xff0000),
                Params.width/2, 400
            )
        )
    }
}