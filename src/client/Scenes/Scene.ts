import { Container, FederatedPointerEvent } from "pixi.js";
import { GameObject } from "../GameObjects/GameObject";
import { SceneManager } from "./SceneManager";
import { City } from "../GameObjects/City";

export class Scene extends Container {
    gameObjects: GameObject[] = [];
    ranOnce: boolean;
	sceneManager: SceneManager | undefined;

	constructor() {
		super();
		this.sortableChildren = true;
        this.ranOnce = false;
	}

	addGameObject(go: GameObject) {
		this.gameObjects.push(go);
		this.addChild(go);
	}

	removeGameObject(go: GameObject) {
		this.gameObjects.splice(this.gameObjects.indexOf(go), 1);
	}

    awake() {}

	update(deltaTime: number) {
        if (!this.ranOnce) {
            this.ranOnce = true;
            this.awake();
        }

		this.gameObjects.forEach((go) => {
			go.update(deltaTime);
		});
	}

	manageSelection(city: City, e: FederatedPointerEvent) {
        throw "This scene doesn't have this behavior set up!";
    }
}