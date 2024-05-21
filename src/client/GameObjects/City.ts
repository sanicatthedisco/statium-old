import { Application, Graphics, Container, Ticker, Point, BitmapFont, BitmapText, FederatedPointerEvent } from 'pixi.js';
import { GameObject } from './GameObject';
import { Troop } from './Troop';
import { Scene } from '../Scenes/Scene';
import { CityData } from '../Utils/Communication';
//import { ServerCity } from '../../server';

export class City extends GameObject {
	static maxTroopCount: number = 99;
	static troopIncreaseInterval: number = 70;
	static radius = 20;

	static originHighlightColor: number = 0x0000aa;
	static destinationHighlightColor: number = 0xaa0000;
	static highlightThickness: number = 5;

	static playerColors: number[] = [0x2ba9b4, 0xe39aac, 0x93d4b5, 0xf0dab1];
	static defaultColor: number = 0x888888;

	text: BitmapText;
	color: number;
	troopCount: number = 10;
	troopIncreaseCounter: number = 0;
	radius: number;
	ownerId?: string;
	ownerSlot?: number;
	id: number;

	troopSendNumber: number = 0;
	destination: any = undefined;
	troopSpawnTicker: number = 0;
	troopSpawnInterval: number = 9;

	constructor(x: number, y: number, scene: Scene, id: number, ownerId?: string, ownerSlot?: number) {
		super(x, y, scene);

		this.id = id;
		this.ownerId = ownerId;
		this.ownerSlot = ownerSlot;

		this.color = 0xdddddd;
		this.radius = 20;

		// Also set color and draws shape

		this.updateSelf(this.ownerId, this.ownerSlot, this.x, this.y, this.troopCount);

		this.zIndex = 1;

		// Troop number text
		this.text = new BitmapText("0", {
			fontName: "TroopCountFont",
			fontSize: 25,
			align: "center"
		})
		this.text.anchor.set(0.5, 0.5);
		this.text.roundPixels = true;
		this.addChild(this.text);
		this.text.text = this.troopCount.toString();

		// Deal with mouse clicks
		this.eventMode = "dynamic";
		this.on("pointertap", this.onClick, this);
	}

	override update(deltaTime: number) {
		// Replenish troops over time, but only if we're not sending troops currently
		if (this.troopSendNumber == 0) {
			this.troopIncreaseCounter += deltaTime;
		}
		if (this.troopIncreaseCounter > City.troopIncreaseInterval) {
			this.troopIncreaseCounter = 0;
			this.increaseTroopCount(1);
		}

		// If we have troops to send, send them out at regular intervals
		if (this.troopSendNumber > this.troopCount) {
			this.troopSendNumber = this.troopCount;
		}
		this.troopSpawnTicker += deltaTime;
		if (this.ownerId) {
			if (this.troopSendNumber > 0 && this.troopSpawnTicker > this.troopSpawnInterval) {
				this.troopSendNumber -= 1;
				this.troopSpawnTicker = 0;
				new Troop(this.x, this.y, this.destination, this.scene, this.ownerId);
				this.increaseTroopCount(-1);
			}
		} else {
			if (this.troopSendNumber > 0) { console.error("A city with no ownerId is trying to send troops! Why??"); }
		}
	}

	sendTroops(quantity: number, destination: City) {
		this.troopSendNumber = quantity;
		this.destination = destination;
	}

	increaseTroopCount(count: number) {
		if (count > 0 && this.troopCount < City.maxTroopCount) {
			this.troopCount += count;
		}
		if (count < 0 && this.troopCount > 0) {
			this.troopCount += count;
		} 
		this.text.text = this.troopCount.toString();
	}

	onClick(e: FederatedPointerEvent) {
		this.scene.manageSelection(this, e);
	}

	selectAs(type: String) {
		this.graphics.clear();

		if (type == "origin") {
			this.graphics.beginFill(City.originHighlightColor);
			this.graphics.drawCircle(0, 0, this.radius + City.highlightThickness);
			this.graphics.endFill();
		} else if (type == "destination") {
			this.graphics.beginFill(City.destinationHighlightColor);
			this.graphics.drawCircle(0, 0, this.radius + City.highlightThickness);
			this.graphics.endFill();
		} else if (type != "none") {
			throw "Not a valid selection type.";
		}

		this.graphics.beginFill(this.color);
		this.graphics.drawCircle(0, 0, this.radius);
		this.graphics.endFill();
	}

	updateSelf(ownerId: string | undefined, ownerSlot: number | undefined, x: number, y: number, troopCount: number) {
		this.ownerId = ownerId;
		this.ownerSlot = ownerSlot;
		this.x = x;
		this.y = y;
		this.troopCount = troopCount;

		if (this.ownerSlot != undefined) {
			console.log("owner change");
			this.color = City.playerColors[this.ownerSlot];
		} else {
			console.log("wtf");
		}

		this.graphics.beginFill(this.color);
		this.graphics.drawCircle(0, 0, this.radius);
		this.graphics.endFill();
	}

	toCityData(): CityData {
		return {
			id: this.id,
			ownerId: this.ownerId,
			ownerSlot: this.ownerSlot,
			x: this.x,
			y: this.y,
			troopCount: this.troopCount
		};
	}
}