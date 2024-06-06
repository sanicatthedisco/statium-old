import { CityData, GameState, TroopData } from "../shared/Utils/Communication";
import { GameParameters as Params } from "../shared/Utils/GameParameters";
import { Vector2 } from "../shared/Utils/Vector2";
import ServerCityRepresentation from "./GameObjectRepresentations/ServerCityRepresentation";
import ServerTroopRepresentation from "./GameObjectRepresentations/ServerTroopRepresentation";
import MapBuilder from "../shared/Utils/MapBuilder";

// We simulate in a very similar way to the clients
// essentially running our own version of the game
// but without any rendering or player controls.

export class GameSimulator {
    troops: ServerTroopRepresentation[] = [];
    cities: ServerCityRepresentation[] = [];

    simulationTime: number;

    updateTicker: number = 0; //debug

    constructor(cityDataList: CityData[]) {
        this.simulationTime = Date.now();

        this.cities = cityDataList.map((cd) => (
            ServerCityRepresentation.fromCityData(cd, this)
        ));
    }

    stepForward(deltaTime: number) {
        // May be a problem that this might happen in a diff order from clients
        // but prob not
        this.troops.forEach((troop, i, arr) => {
            troop.update(deltaTime);
            if (troop.destroyMe) {
                arr.splice(i, 1);
            }
        });
        this.cities.forEach((city) => {
            city.update(deltaTime);
        })
        this.simulationTime += deltaTime;
    }
    stepForwardTo(targetSimulationTime: number) {
        if (targetSimulationTime - this.simulationTime <= 0 && this.simulationTime % 100 == 0)
            console.warn("Target simulation time is before or during most recent simulation time!");
        else
            this.stepForward(targetSimulationTime - this.simulationTime);
    }

    getGameState(): GameState {
        let cityDataList = this.cities.map((city) => (
            city.toCityData()
        ));
        return {
            cityDataList: cityDataList,
            creationTime: Date.now(),
        };
    }

}



