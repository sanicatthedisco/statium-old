import { Container } from "pixi.js";
import { NetworkManager } from "../Networking/NetworkManager";
import { Scene } from "./Scene";
import { GameState } from "../../shared/Utils/Communication";
import { MainScene } from "./MainScene";
import MenuScene from "./Menus/MenuScene";

export class SceneManager {
    activeScene?: Scene;
    networkManager: NetworkManager;
    stage: Container;

    constructor(stage: Container, networkManager: NetworkManager) {
        this.stage = stage;
        this.networkManager = networkManager;
        this.networkManager.sceneManager = this;
    }

    leaveGame() {
        if (!(this.activeScene instanceof MainScene)) throw new Error("Trying to leave although not in a game!");
        this.setScene(new MenuScene());
        this.networkManager.leaveLobby();
    }

    imposeGameState(gameState: GameState) {
        // Probably very unoptimized
        if (this.activeScene instanceof MainScene) {
            if (!this.activeScene.map) throw new Error("Scene has not been properly initialized yet");
            gameState.cityDataList.forEach((cityData) => {
                let matchingCity = (this.activeScene as MainScene).map!.regions.find((r) => 
                    (r.city.id == cityData.id)
                )?.city;

                if (matchingCity == undefined) {
                    throw new Error("A city has not been synced properly");
                } else {
                    matchingCity.setTroopCount(cityData.troopCount);
                    if (matchingCity.ownerId != cityData.ownerId) matchingCity.setOwner(cityData.ownerId);
                    matchingCity.troopSendNumber = cityData.troopSendNumber;
                    matchingCity.destination = (this.activeScene as MainScene).map!.regions
                        .find((r) => (
                            r.city.id==cityData.destinationId
                        ))?.city;
                }
            });
        } else {
            throw new Error("Haven't implemented other game states yet")
        }
    }

    setScene(scene: Scene) {
        if (this.activeScene) this.stage.removeChild(this.activeScene);
        this.activeScene = scene;
        this.activeScene.sceneManager = this;
        this.stage.addChild(this.activeScene);
    }

    update(deltaTime: number) {
        if (this.activeScene) this.activeScene.update(deltaTime);
    }
}