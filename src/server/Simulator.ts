import { CityData, GameState, TroopData } from "../client/Utils/Communication";
import { GameParameters as Params } from "../client/Utils/GameParameters";
import { Vector2 } from "../client/Utils/Vector2";
import ServerCityRepresentation from "./GameObjectRepresentations/ServerCityRepresentation";
import ServerTroopRepresentation from "./GameObjectRepresentations/ServerTroopRepresentation";

// We simulate in a very similar way to the clients
// essentially running our own version of the game
// but without any rendering or player controls.

export class GameSimulator {
    troops: ServerTroopRepresentation[] = [];
    cities: ServerCityRepresentation[] = [];

    constructor(cities: ServerCityRepresentation[]) {
        this.cities = cities;
    }

    updateGameState(deltaTime: number) {
        // May be a problem that this might happen in a diff order from clients
        // but prob not
        this.troops.forEach((troop) => {
            troop.update(deltaTime);
        });
        this.cities.forEach((city) => {
            city.update(deltaTime);
        })
    }

    /*
    evolveGameState(deltaTime: number) {
        const newGameState = {
            cityDataList: [],
            troopDataList: [],
            creationTime: this.gameState.creationTime + deltaTime,
        };
    
        // Loop through troops
            // Move troop requisite amount
            // Check if intersected target along the way
                // Interact and delete self
    
        // Loop through cities
            // Send troops if needed
                // Add troops to troop list
                // Creating troops: just find time of intersection?
            // Regenerate troops otherwise
    
            // Change owners if conquered
    
        this.gameState.cityDataList.forEach((cd, i, arr) => {

            // // Send troops
            let simulationTime = this.gameState.creationTime;
            // Simulates time increasing and spawning troops over that time
            while (cd.troopSendNumber > 0 && simulationTime < newGameState.creationTime) {
                // Find time elapsed since last troop was spawned for this city
                let elapsedTime: number;
                if (!cd.lastSentTroop) elapsedTime = Infinity;
                else elapsedTime = simulationTime - cd.lastSentTroop.creationTime;
    
                if (elapsedTime >= Params.troopSpawnInterval) {
                    arr[i].troopSendNumber --;
                    arr[i].lastSentTroop = this.spawnTroop(cd, simulationTime);
                }
    
                simulationTime += Params.troopSpawnInterval;
            }

            if (cd.troopSendNumber == 0 && 
                (!cd.lastSentTroop || simulationTime - cd.lastSentTroop?.creationTime < )) {

                }
        });
    
    
        this.gameState = newGameState;
    }
    

    spawnTroop(owner: CityData, time: number): TroopData {
        if (!owner.destinationId) throw new Error("A city is trying to send a troop but doesn't have a destination!");
        if (!owner.ownerId) throw new Error("A city is trying to send a troop without an owner!");
        let dest = this.findCityDataById(owner.destinationId);

        let distance = Vector2.Subtract(new Vector2(dest.x, dest.y), 
                                         new Vector2(owner.x, owner.y))
                                         .magnitude();
    
        let troop: TroopData = {
            destinationId: owner.destinationId,
            dirVector: Vector2.Subtract(new Vector2(dest.x, dest.y), 
                                        new Vector2(owner.x, owner.y)),
            ownerId: owner.ownerId,
            creationTime: time,
            arrivalTime: time + (distance / Params.troopSpeed), //should work i think??
        }
    
        this.gameState.troopDataList.push(troop);
        return troop;
    }

    findCityDataById(id: number): CityData {
        let foundCd = this.gameState.cityDataList.find((cd) => (
            cd.id == id
        ));

        if (!foundCd) throw new Error("Could not find citydata with that id!");
        
        return foundCd;
    }
    */

}



