import { Application, Graphics, Container, Ticker, Point, BitmapFont, BitmapText } from 'pixi.js'
import { GameObject } from './GameObject';
import { Vector2 } from '../Utils/Vector2';
import { Scene } from '../Scenes/Scene';
import { City } from './City';
import { CityData } from '../Utils/Communication';
import { GameParameters as Params } from '../Utils/GameParameters';
import Color from 'color';

export class Troop extends GameObject {
	destination: City;
	dirVector: Vector2;
	ownerId: string;
	color: Color;
	lastTime: number = Date.now();

	constructor(x: number, y: number, destination: City, scene: Scene, 
		ownerId: string, color: Color, id?: number) {
		super(x, y, scene);

		this.destination = destination;
		this.ownerId = ownerId;
		
		this.color = color;
		this.graphics.beginFill(this.color.hex());
		this.graphics.drawCircle(0, 0, Params.troopRadius);
		this.graphics.endFill();
		this.zIndex = 0;

		this.dirVector = new Vector2(0, 0);
	}

	override update(deltaTime: number) {
		let timeNow = Date.now();
		let dt = timeNow - this.lastTime;
		this.dirVector = Vector2.Subtract(this.destination.pos(), this.pos());
		this.move(Vector2.Multiply(this.dirVector.norm(), Params.troopSpeed * dt));
		this.lastTime = Date.now();

		if (this.dirVector.magnitude() < Params.cityRadius) {
			this.destination.interactWithTroop(this.ownerId);
			this.destroy();
		}
	}
}