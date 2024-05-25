import { FederatedPointerEvent } from "pixi.js";
import { Scene } from "./Scene";
import { City } from "../GameObjects/City";
import { CityData, Command, GameState } from "../Utils/Communication";

export class MainScene extends Scene {
    originSelection: City | undefined = undefined;
    destinationSelection: City | undefined = undefined;

    cities: City[] = [];

    initializeCities(cityData: CityData[]) {
        cityData.forEach((city) => {
            this.cities.push(new City(city.x, city.y, this, city.id, city.ownerId, city.ownerSlot));
        });
    }
    updateCity(cityData: CityData) {
        let matchingCity = this.cities.find((city) => {return city.id == cityData.id});
        if (matchingCity == undefined) {
            console.log("A city has not been synced properly.")
        } else {
            matchingCity.updateSelf(cityData.ownerId, cityData.ownerSlot, cityData.x, cityData.y, cityData.troopCount);
        }
    }

    issueCommand(origin: City, destination: City, troopSendNumber: number) {
        origin.commandToSendTroops(troopSendNumber, destination);
        let command: Command = {
            originId: origin.id,
            destinationId: destination.id,
            troopCount: troopSendNumber
        }
        this.sceneManager!.networkManager.commandBuffer.push(command);
    }

    getCityDataList(): CityData[] {
        let cityDataList: CityData[] = [];
        this.cities.forEach((city) => {
            let cityData = City.toCityData(city);
            cityDataList.push(cityData);
        }); 
        return cityDataList;
    }

    // A bunch of spaghetti. Controls which cities are selected
    // as the origin and destination for a troop movement
    // and if both are selected, initiates movement,
    // then deselects them.s
    override manageSelection(city: City, e: FederatedPointerEvent) {
        if (this.originSelection === undefined) {
            this.originSelection = city;
            city.selectAs("origin");
        } else {
            if (this.originSelection == city) {
                this.originSelection = undefined;
                city.selectAs("none");

                this.destinationSelection?.selectAs("none");
                this.destinationSelection = undefined;
            } else {
                if (this.destinationSelection == city) {
                    this.destinationSelection = undefined;
                    city.selectAs("none");
                } else {
                    /*
                    this.destinationSelection = city;
                    city.selectAs("destination");
                    */

                    this.issueCommand(this.originSelection, city, this.originSelection.troopCount);
                    
                    city.selectAs("none");
                    this.originSelection.selectAs("none");
                    this.destinationSelection = undefined;
                    this.originSelection = undefined;
                }
            }
        }
    }
}