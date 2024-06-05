import { Input } from "@pixi/ui";
import { StylizedText, StylizedInputFactory, StylizedButton } from "../../UI/UI";
import { Scene } from "../Scene";
import { GameParameters as Params } from "../../Utils/GameParameters";
import MenuScene from "./MenuScene";
import Color from "color";

export default class JoinGameMenuScene extends Scene {
    input: Input;

    constructor() {
        super();

        this.addChild(
            new StylizedText(
                "Join an existing room", 35, Color(0x555555),
                Params.width/2, 100
            )
        );

        this.input = (new StylizedInputFactory()).buildInput("Enter ID of the room to join",
                    Params.width/2, 200, 350, 50)
        this.addChild(this.input);

        this.addChild(
            new StylizedButton("Join",
                Params.width/2, 270,
                100, 50, 
                () => {
                    //TODO: sanitize
                    this.sceneManager?.networkManager.requestLobbyJoin(this.input.value);
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
            new StylizedText("No room could be found with this ID",
                20, Color(0xdd0000),
                Params.width/2, 400
            )
        )
    }
}