import { Container } from "pixi.js";
import { NetworkManager } from "../Networking/NetworkManager";
import { Scene } from "./Scene";
import { GameState } from "../Utils/Communication";
import { MainScene } from "./MainScene";

export class SceneManager {
    activeScene?: Scene;
    networkManager: NetworkManager;
    stage: Container;

    constructor(stage: Container, networkManager: NetworkManager) {
        this.stage = stage;
        this.networkManager = networkManager;
        this.networkManager.sceneManager = this;
    }

    imposeGameState(gameState: GameState) {
        // Probably very unoptimized
        if (this.activeScene instanceof MainScene) {
            gameState.cityDataList.forEach((cityData) => {
                (this.activeScene as MainScene).updateCity(cityData);
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