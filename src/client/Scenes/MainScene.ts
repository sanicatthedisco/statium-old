import { FederatedPointerEvent } from "pixi.js";
import { Scene } from "./Scene";
import { City } from "../GameObjects/City";
import { CityData } from "../Networking/NetworkManager";

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
        console.log(cityData);
        if (matchingCity == undefined) {
            console.log("A city has not been synced properly.")
        } else {
            matchingCity.updateSelf(cityData.ownerId, cityData.ownerSlot, cityData.x, cityData.y);
        }
    }

    // A bunch of spaghetti. Controls which cities are selected
    // as the origin and destination for a troop movement
    // and if both are selected, initiates movement,
    // then deselects them.
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

                    this.originSelection.sendTroops(this.originSelection.troopCount, 
                                                    city);
                    
                    city.selectAs("none");
                    this.originSelection.selectAs("none");
                    this.destinationSelection = undefined;
                    this.originSelection = undefined;
                }
            }
        }
    }
}