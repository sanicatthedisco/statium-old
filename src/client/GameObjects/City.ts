import { BitmapText, FederatedPointerEvent } from 'pixi.js';
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
	id: number;

	troopSendNumber: number = 0;
	destination?: City = undefined;
	lastSpawnTime?: number;
	lastTroopIncreaseTime?: number;
	lastTroopDamageTime?: number;
	ownerIdOfLastDamagingTroop?: string;

	constructor(x: number, y: number, scene: Scene, id: number, ownerId?: string, ownerSlot?: number) {
		super(x, y, scene);

		this.id = id;
		this.ownerId = ownerId;

		this.color = City.defaultColor;
		this.radius = 20;

		this.setOwner(ownerId);

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

		this.setTroopCount(this.troopCount);

		// Deal with mouse clicks
		this.eventMode = "dynamic";
		this.on("pointertap", this.onClick, this);
	}

	override update(deltaTime: number) {
		// Send troops out at intervals if they need to be sent
		// And only regenerate troops if we're not currently sending any

		if (this.troopCount < 0) {
			// We should change owners, but let's wait for the server to adjudicate that for us.
			// in the mean time, stop doing anything
		} else {
			if (this.troopSendNumber > 0) {
				this.sendTroopsIfPossible();
			} else {
				this.regenerateTroops();
			}
		}



	}

	sendTroopsIfPossible() {
		if (this.troopCount <= 1) {
			this.troopSendNumber = 0;
		}

		let now = Date.now();
		if (!this.lastSpawnTime) this.lastSpawnTime = now; // on first loop, init

		// Spawn troops at intervals
		if (this.troopCount > 1 && // If we have troops to send
		now - this.lastSpawnTime > Params.troopSpawnInterval // And the interval has elapsed
		&& this.ownerId && this.destination) { // Sanity check that we have an owner and a destination
				
			// Spawn the troop and update the relevant counters
			new Troop(this.x, this.y, this.destination, this.scene, this.ownerId);

			this.changeTroopCountBy(-1);
			this.lastSpawnTime = now;
		}
	}

	regenerateTroops() {
		let now = Date.now();
		if (!this.lastTroopIncreaseTime) this.lastTroopIncreaseTime = now;
		if (!this.lastTroopDamageTime) this.lastTroopDamageTime = now;

		if (now - this.lastTroopIncreaseTime > Params.troopIncreaseInterval &&
			now - this.lastTroopDamageTime > Params.damageRecoveryTime) {
			this.changeTroopCountBy(1);

			this.lastTroopIncreaseTime = now;
		}
	}
	
	public interactWithTroop(troopOwnerId: string) {
		if (this.ownerId == troopOwnerId) {
			this.changeTroopCountBy(1);
		} else {
			this.lastTroopDamageTime = Date.now();
			this.ownerIdOfLastDamagingTroop = troopOwnerId;

			this.changeTroopCountBy(-1);
			// let the server handle the ownership change

			/*else {
				if (!this.scene.sceneManager) throw new Error("Scenemanager is undefined!");
				else {
					this.ownerId = troopOwnerId;
					this.ownerSlot = this.scene.sceneManager.networkManager.getClientSlot(troopOwnerId);
				}
			}*/
		}
	}

	// Changing state

	setTroopCount(count: number) {
		if (count < (this.ownerId ? Params.maxTroopCount : Params.maxTroopCountUnowned)) {
			this.troopCount = count;
		} else {
			this.troopCount = this.ownerId ? Params.maxTroopCount : Params.maxTroopCountUnowned;
		}

		if (!this.text) throw new Error("There is no text on this city!");
		this.text.text = this.troopCount.toString();
	}
	changeTroopCountBy = (delta: number) => {this.setTroopCount(this.troopCount + delta)};

	setOwner(newOwnerId: string | undefined) {
		this.ownerId = newOwnerId;

		let newSlot: number | undefined;
		if (!newOwnerId) {
			this.color = City.defaultColor;
		} else {
			if (!this.scene.sceneManager) throw new Error("No scene manager set");
			else newSlot = this.scene.sceneManager.networkManager.getClientSlot(newOwnerId!);

			if (!newSlot) throw new Error("This client has no slot!");
			this.color = City.playerColors[newSlot];
		}

		this.graphics.beginFill(this.color);
		this.graphics.drawCircle(0, 0, this.radius);
		this.graphics.endFill();
	}

	/*

	updateSelf(cd: CityData) {
		this.ownerId = cd.ownerId;
		this.ownerSlot = cd.ownerSlot;
		this.x = cd.x;
		this.y = cd.y;
		this.troopCount = cd.troopCount;

		if (this.ownerSlot != undefined) {
			this.color = City.playerColors[this.ownerSlot];
		}

		if (this.text) this.text.text = (this.troopCount < 0 ? "-" : "") + this.troopCount.toString();

		this.graphics.beginFill(this.color);
		this.graphics.drawCircle(0, 0, this.radius);
		this.graphics.endFill();
	}
	*/

	// User control

	commandToSendTroops(quantity: number, destination: City) {
		this.troopSendNumber = quantity;
		this.destination = destination;
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

	// Utility method
	static toCityData(city: City): CityData {
		return {
			id: city.id,
			ownerId: city.ownerId,
			x: city.x,
			y: city.y,
			troopCount: city.troopCount,
			destinationId: city.destination?.id,
			troopSendNumber: city.troopSendNumber,
			lastTroopDamageTime: city.lastTroopDamageTime,
			ownerIdOfLastDamagingTroop: city.ownerIdOfLastDamagingTroop
		};
	}
}