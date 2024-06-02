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

	// debug
	id?: number;
	lastTime: number = Date.now();
	initTime: number;
	lastDirVector: Vector2;

	constructor(x: number, y: number, destination: City, scene: Scene, ownerId: string, id?: number) {
		super(x, y, scene);

		this.destination = destination;
		this.ownerId = ownerId;

		this.graphics.beginFill(Params.playerColors[0]);
		this.graphics.drawCircle(0, 0, Params.troopRadius);
		this.graphics.endFill();
		this.zIndex = 0;

		this.dirVector = new Vector2(0, 0);
		this.lastDirVector = this.dirVector;
		this.id = id;
		this.initTime = Date.now();
	}

	override update(deltaTime: number) {
		let timeNow = Date.now();
		let dt = timeNow - this.lastTime;
		this.dirVector = Vector2.Subtract(this.destination.pos(), this.pos());
		this.move(Vector2.Multiply(this.dirVector.norm(), Params.troopSpeed * dt));
		this.lastTime = Date.now();
		/*
		if (this.id == 1) {
			console.log(timeNow-this.initTime, 
				(this.lastDirVector.magnitude() - this.dirVector.magnitude())/ dt);
		}
		*/
		if (this.dirVector.magnitude() < Params.cityRadius) {
			this.destination.interactWithTroop(this.ownerId);
			this.destroy();
		}

		this.lastDirVector = this.dirVector;
	}
}