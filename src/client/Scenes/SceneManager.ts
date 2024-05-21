import { Container } from "pixi.js";
import { NetworkManager } from "../Networking/NetworkManager";
import { Scene } from "./Scene";

export class SceneManager {
    activeScene?: Scene;
    networkManager: NetworkManager;
    stage: Container;

    constructor(stage: Container, networkManager: NetworkManager) {
        this.stage = stage;
        this.networkManager = networkManager;
        this.networkManager.sceneManager = this;

        const button = document.createElement("button");
        button.innerHTML = "Click me!";
        button.onclick = () => {
            console.log(this.networkManager.clients[0].id);
        }
        document.body.appendChild(button);
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