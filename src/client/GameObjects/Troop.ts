import { Application, Graphics, Container, Ticker, Point, BitmapFont, BitmapText } from 'pixi.js'
import { GameObject } from './GameObject';
import { Vector2 } from '../Utils/Vector2';
import { Scene } from '../Scenes/Scene';
import { City } from './City';

export class Troop extends GameObject {
	static radius: number = 10;
	static troopSpeed: number = 3;

	destination: City;
	dirVector: Vector2;
	speed: number;
	ownerId: string;

	constructor(x: number, y: number, destination: City, scene: Scene, ownerId: string) {
		super(x, y, scene);

		this.destination = destination;
		this.ownerId = ownerId;

		this.graphics.beginFill(City.playerColors[0]);
		this.graphics.drawCircle(0, 0, Troop.radius);
		this.graphics.endFill();
		this.zIndex = 0;

		this.dirVector = new Vector2(0, 0);

		this.speed = Troop.troopSpeed;
	}

	override update(deltaTime: number) {
		this.dirVector = Vector2.Subtract(this.destination.pos(), this.pos());
		this.move(Vector2.Multiply(this.dirVector.norm(), this.speed * deltaTime));

		if (this.dirVector.magnitude() < 20) {
			if (this.destination.ownerId == this.ownerId) {
				this.destination.increaseTroopCount(1);
			} else {
				if (this.destination.troopCount > 0) { 
					this.destination.increaseTroopCount(-1);
				} else {
					this.destination.updateSelf(this.ownerId, this.scene.sceneManager.networkManager.getClientSlot(this.ownerId),
												this.destination.x, this.destination.y);
				}
			}
			this.destroy();
		}
	}
}