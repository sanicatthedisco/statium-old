import { Vector2 } from "../../shared/Utils/Vector2";
import ServerTroopRepresentation from "./ServerTroopRepresentation";
import { GameParameters as Params } from "../../shared/Utils/GameParameters";
import { CityData } from "../../shared/Utils/Communication";
import { Server } from "socket.io";
import { GameSimulator } from "../Simulator";

export default class ServerCityRepresentation {
    position: Vector2;
    id: number;
    ownerId?: string;

    troopCount: number = Params.defaultTroopQuantity;
    troopSendNumber: number = 0;
    ownerIdOfLastDamagingTroop?: string;

    lastSpawnTime?: number;
    lastTroopIncreaseTime?: number;
    lastTroopDamageTime?: number;
    destination?: ServerCityRepresentation;

	simulator: GameSimulator;

    constructor(id: number, position: Vector2, simulator: GameSimulator, ownerId?: string,) {
        this.position = position;
        this.id = id;
        this.ownerId = ownerId;
		this.simulator = simulator;
    }

    update(deltaTime: number) {
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
			this.simulator.troops.push(new ServerTroopRepresentation(this.position, 
				this.destination, this.ownerId));

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

			// change owner
			if (this.troopCount <= 0) {
				this.ownerId = troopOwnerId;
				this.troopSendNumber = 0;
			}
		}
	}

    // Changing state

    setTroopCount(count: number) {
		if (count < (this.ownerId ? Params.maxTroopCount : Params.maxTroopCountUnowned)) {
			this.troopCount = count;
		} else {
			this.troopCount = this.ownerId ? Params.maxTroopCount : Params.maxTroopCountUnowned;
		}
	}
	changeTroopCountBy = (delta: number) => {this.setTroopCount(this.troopCount + delta)};

    // Data management and interchange

    static fromCityData(cd: CityData, sim: GameSimulator): ServerCityRepresentation {
        let city = new ServerCityRepresentation(cd.id, new Vector2(cd.x, cd.y), sim, cd.ownerId);
        city.troopCount = cd.troopCount;
        city.troopSendNumber = cd.troopSendNumber;
        // ...might need to add more of these

        return city;
    }

    toCityData(): CityData {
        return {
            id: this.id,
            x: this.position.x,
            y: this.position.y,
            ownerId: this.ownerId,
            troopCount: this.troopCount,
            troopSendNumber: this.troopSendNumber,
            destinationId: this.destination?.id,
        };
    };
}