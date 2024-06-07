import { BitmapText, FederatedPointerEvent } from 'pixi.js';
import { GameObject } from './GameObject';
import { Troop } from './Troop';
import { Scene } from '../Scenes/Scene';
import { CityData } from '../../shared/Utils/Communication';
import { GameParameters as Params } from '../../shared/Utils/GameParameters';
import { Region } from './Region';
import Color from 'color';
//import { ServerCity } from '../../server';

export class City extends GameObject {
	text: BitmapText;
	color: Color;
	troopCount: number = Params.defaultTroopQuantity;
	troopIncreaseTicker: number = 0;
	ownerId?: string;
	id: number;

	troopSendNumber: number = 0;
	destination?: City = undefined;
	lastSpawnTime?: number;
	lastTroopIncreaseTime?: number;
	lastTroopDamageTime?: number;
	ownerIdOfLastDamagingTroop?: string;

	lastTextUpdateTime: number = 0;

	region?: Region;

	//debug
	highestTroopId = 0;

	constructor(x: number, y: number, scene: Scene, id: number, ownerId?: string, ownerSlot?: number) {
		super(x, y, scene);

		this.id = id;
		this.ownerId = ownerId;

		this.color = Params.defaultCityColor;

		this.setOwner(ownerId);

		this.zIndex = 1;

		// Troop number text
		this.text = new BitmapText("0", {
			fontName: "TroopCountFont",
			fontSize: Params.cityFontSize,
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
			this.highestTroopId ++;
			new Troop(this.x, this.y, this.destination, this.scene, this.ownerId, this.color, this.highestTroopId);

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

		if (Date.now() - this.lastTextUpdateTime > Params.textUpdateInterval) {
			this.lastTextUpdateTime = Date.now();
			this.text.text = this.troopCount.toString();
		}
	}
	changeTroopCountBy = (delta: number) => {this.setTroopCount(this.troopCount + delta)};

	setOwner(newOwnerId: string | undefined) {
		this.ownerId = newOwnerId;

		let newSlot: number | undefined;
		if (!newOwnerId) {
			this.color = Params.defaultCityColor;
		} else {
			if (!this.scene.sceneManager) throw new Error("No scene manager set");
			else newSlot = this.scene.sceneManager.networkManager.getClientSlot(newOwnerId!);

			if (!newSlot) throw new Error("This client has no slot!");
			this.color = Params.playerColors[newSlot-1];
		}

		this.graphics.beginFill(this.color.hex());
		this.graphics.drawCircle(0, 0, Params.cityRadius);
		this.graphics.endFill();

		this.region?.updateColor(this.color);
	}

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
			this.graphics.beginFill(Params.originHighlightColor.hex());
			this.graphics.drawCircle(0, 0, Params.cityRadius + Params.highlightThickness);
			this.graphics.endFill();
		} else if (type == "destination") {
			this.graphics.beginFill(Params.destinationHighlightColor.hex());
			this.graphics.drawCircle(0, 0, Params.cityRadius + Params.highlightThickness);
			this.graphics.endFill();
		} else if (type != "none") {
			throw "Not a valid selection type.";
		}

		this.graphics.beginFill(this.color.hex());
		this.graphics.drawCircle(0, 0, Params.cityRadius);
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