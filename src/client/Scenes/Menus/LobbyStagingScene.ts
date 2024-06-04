import { Container, Graphics } from "pixi.js";
import { Client } from "../../Utils/Communication";
import { Scene } from "../Scene";
import { GameParameters as Params } from "../../Utils/GameParameters";
import { StylizedButton, StylizedText } from "../../UI/UI";

const testClients: Client[] = [
    {
        id: "a",
        slot: 1,
        isOwner: true
    },
    {
        id: "b",
        slot: 2,
        isOwner: false
    },
    {
        id: "c",
        slot: 3,
        isOwner: false
    },
    {
        id: "d",
        slot: 4,
        isOwner: false
    },
]

export default class LobbyStagingScene extends Scene {
    marginX = (Params.width - LobbyPlayerTile.width*2)/3;
    marginY = 30;
    offsetY = 125;
    clientContainer: Container;

    constructor(isCreator: boolean) {
        super();

        // Title
        this.addChild(
            new StylizedText(
                "Waiting for players", 30, 
                Params.titleColor,
                Params.width/2, 50
            )
        );

        this.clientContainer = new Container();
        this.addChild(this.clientContainer);

        this.updateClients(testClients);

        // Button to start game
        if (isCreator) {
            this.addChild(
                new StylizedButton(
                    "Start game",
                    Params.width/2, Params.height - 100,
                    200, 50,
                    () => {
                        this.sceneManager?.networkManager.requestGameStart();
                    }
                )
            );
        }
    }

    updateClients(clients: Client[]) {
        // Clear clients
        while (this.clientContainer.children[0]) {
            this.clientContainer.removeChildAt(0);
        };

        clients.forEach((client, i) => {
            // converting to 0 index for some reason
            if ((client.slot-1) % 2 == 0) { // evens
                this.clientContainer.addChild(
                    new LobbyPlayerTile(this.marginX, 
                        this.offsetY + ((this.marginY + LobbyPlayerTile.height) * (client.slot-1)/2), 
                        client)
                );
            } else { // odds
                this.clientContainer.addChild(
                    new LobbyPlayerTile(this.marginX * 2 + LobbyPlayerTile.width, 
                        this.offsetY + ((this.marginY + LobbyPlayerTile.height) * (client.slot-2)/2), 
                        client)
                );
            }
        });
    }
}

class LobbyPlayerTile extends Container {
    static radius = 30;
    static width = 250;
    static height = 90;
    static color = 0xcccccc;

    gr: Graphics;
    
    constructor(x: number, y: number, clientInfo: Client) {
        super();
        const playerColor = Params.playerColors[clientInfo.slot];

        this.x = x;
        this.y = y;

        // Background
        this.gr = new Graphics().beginFill(LobbyPlayerTile.color)
            .drawRoundedRect(0, 0, LobbyPlayerTile.width, LobbyPlayerTile.height, 5)
            .endFill();
        // Player icon
        this.gr.beginFill(0xffffff)
            .drawCircle(LobbyPlayerTile.width/2, LobbyPlayerTile.height/2, LobbyPlayerTile.radius+3)
            .endFill();
        this.gr.beginFill(playerColor)
            .drawCircle(LobbyPlayerTile.width/2, LobbyPlayerTile.height/2, LobbyPlayerTile.radius)
            .endFill();
        
        this.addChild(this.gr);
    }
}