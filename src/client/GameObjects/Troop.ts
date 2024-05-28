import { Application, Graphics, Container, Ticker, Point, BitmapFont, BitmapText } from 'pixi.js'
import { GameObject } from './GameObject';
import { Vector2 } from '../Utils/Vector2';
import { Scene } from '../Scenes/Scene';
import { City } from './City';
import { CityData } from '../Utils/Communication';
import { GameParameters as Params } from '../Utils/GameParameters';

export class Troop extends GameObject {
	destination: City;
	dirVector: Vector2;
	ownerId: string;

	constructor(x: number, y: number, destination: City, scene: Scene, ownerId: string) {
		super(x, y, scene);

		this.destination = destination;
		this.ownerId = ownerId;

		this.graphics.beginFill(Params.playerColors[0]);
		this.graphics.drawCircle(0, 0, Params.troopRadius);
		this.graphics.endFill();
		this.zIndex = 0;

		this.dirVector = new Vector2(0, 0);
	}

	override update(deltaTime: number) {
		this.dirVector = Vector2.Subtract(this.destination.pos(), this.pos());
		this.move(Vector2.Multiply(this.dirVector.norm(), Params.troopSpeed * deltaTime));

		if (this.dirVector.magnitude() < 20) {
			this.destination.interactWithTroop(this.ownerId);
			this.destroy();
		}
	}
}