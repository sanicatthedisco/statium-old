import { Application, Graphics, Container, Ticker, Point, BitmapFont, BitmapText, FederatedPointerEvent } from 'pixi.js';
import { GameObject } from './GameObject';
import { Troop } from './Troop';
import { Scene } from '../Scenes/Scene';
import { CityData } from '../Utils/Communication';
import { GameParameters as Params } from '../Utils/GameParameters';
//import { ServerCity } from '../../server';

export class City extends GameObject {
	static maxTroopCount: number = 99;
	static radius = 20;

	static originHighlightColor: number = 0x0000aa;
	static destinationHighlightColor: number = 0xaa0000;
	static highlightThickness: number = 5;

	static playerColors: number[] = [0x2ba9b4, 0xe39aac, 0x93d4b5, 0xf0dab1];
	static defaultColor: number = 0x888888;

	text: BitmapText;
	color: number;
	troopCount: number = 10;
	troopIncreaseTicker: number = 0;
	radius: number;
	ownerId?: string;
	ownerSlot?: number;
	id: number;

	troopSendNumber: number = 0;
	destination?: City = undefined;
	lastSpawnTime?: number;

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
		// Send troops out at intervals if they need to be sent
		// And only regenerate troops if we're not currently sending any

		if (this.troopSendNumber > 0) {
			this.sendTroopsIfPossible();
		} else {
			// Troop regrowth

			this.troopIncreaseTicker += deltaTime;
			if (this.troopIncreaseTicker > Params.troopIncreaseInterval) {
				this.troopIncreaseTicker = 0;
				this.increaseTroopCount(1);
			}
		}
	}

	sendTroopsIfPossible() {
		// Clamp troop send number to available troops
		if (this.troopSendNumber > this.troopCount) {
			this.troopSendNumber = this.troopCount;
		}

		let now = Date.now();
		if (!this.lastSpawnTime) this.lastSpawnTime = now; // on first loop, init

		// Spawn troops at intervals
		if (this.troopSendNumber > 0 && // If we have troops to send
		now - this.lastSpawnTime > Params.troopSpawnInterval // And the interval has elapsed
		&& this.ownerId && this.destination) { // Sanity check that we have an owner and a destination
				
			// Spawn the troop and update the relevant counters
			new Troop(this.x, this.y, this.destination, this.scene, this.ownerId);

			this.increaseTroopCount(-1);
			this.lastSpawnTime = now;
		}
	}

	commandToSendTroops(quantity: number, destination: City) {
		this.troopSendNumber = quantity;
		this.destination = destination;
	}

	increaseTroopCount(count: number) {
		if (count > 0 && this.troopCount < Params.maxTroopCount) {
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
			this.color = City.playerColors[this.ownerSlot];
		}

		if (this.text) this.text.text = this.troopCount.toString();

		this.graphics.beginFill(this.color);
		this.graphics.drawCircle(0, 0, this.radius);
		this.graphics.endFill();
	}

	static toCityData(city: City): CityData {
		return {
			id: city.id,
			ownerId: city.ownerId,
			ownerSlot: city.ownerSlot,
			x: city.x,
			y: city.y,
			troopCount: city.troopCount,
			destinationId: city.destination?.id,
			troopSendNumber: city.troopSendNumber
		};
	}
}