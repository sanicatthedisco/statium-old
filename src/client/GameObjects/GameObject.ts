import { Container, Graphics } from "pixi.js";
import { Scene } from "../Scenes/Scene";
import { Vector2 } from "../../shared/Utils/Vector2";

export class GameObject extends Container {
	graphics: Graphics;
	scene: Scene;

	constructor(x: number, y: number, scene: Scene) {
		super();
		this.x = x;
		this.y = y;

		this.graphics = new Graphics();
		this.addChild(this.graphics);

		this.scene = scene;
		this.scene.addGameObject(this);
	}

	update(deltaTime: number) {}

	move(v: Vector2) {
		this.x = this.x + v.x;
		this.y = this.y + v.y;
	}

	pos() {
		return new Vector2(this.x, this.y);
	}

	override destroy() {
		this.scene.removeGameObject(this);
		super.destroy();
	}
}