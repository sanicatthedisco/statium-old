import { FederatedPointerEvent } from "pixi.js";
import { Scene } from "./Scene";
import { City } from "../GameObjects/City";
import { CityData, Command, GameState, WorldInitData } from "../../shared/Utils/Communication";
import InGamePopupMenu from "../UI/InGamePopupMenu";
import GameMap from "../GameObjects/GameMap";
import GameResultPopupMenu from "../UI/GameResultPopupMenu";
import { Region } from "../GameObjects/Region";

export class MainScene extends Scene {
    originSelection: City | undefined = undefined;
    destinationSelection: City | undefined = undefined;

    //cities: City[] = [];
    map?: GameMap;
    won = false;
    startingPlayerIds: string[] = [];

    constructor() {
        super();
    }

    override update(deltaTime: number) {
        super.update(deltaTime);

        if (this.map && !this.won && this.startingPlayerIds.length > 1) {
            let remainingPlayerIds = this.getRemainingPlayerIds(this.map.regions);
            if (remainingPlayerIds.length == 1) {
                if (!this.sceneManager) throw new Error("No scenemanager found");
                let isWinner = remainingPlayerIds[0] == this.sceneManager.networkManager.socket?.id;
                this.addChild(new GameResultPopupMenu(isWinner, this.sceneManager));
                this.won = true;
            }
        }
    }

    override awake() {
        if (!this.map) throw new Error("No map initialized on awake; can't get starting player IDs");
        this.startingPlayerIds = this.getRemainingPlayerIds(this.map.regions);
    }

    getRemainingPlayerIds(regions: Region[]): string[] {
        let remainingIds: string[] = [];

        regions.forEach((region) => {
            if (region.city.ownerId) {
                if (!(remainingIds.includes(region.city.ownerId)))
                    remainingIds.push(region.city.ownerId)
            }
        });
        return remainingIds;
    }

    initWorld(worldInitData: WorldInitData) {
        if (!this.sceneManager) throw new Error("Scene manager has not been assigned");
        this.addChild(new InGamePopupMenu(this.sceneManager));

        // Turn region data and into regions
        // and instantiate cities from city data as their children
        let regions = worldInitData.regionDataList.map((rd) => {
            const cd = worldInitData.cityDataList.find((cd) => (cd.id == rd.id))
            if (!cd) throw new Error("No corresponding city found!");

            const r = new Region(
                rd.points,
                new City(cd.x, cd.y, this, cd.id),
                this
            );
            r.city.region = r;

            return r;
        })

        this.map = new GameMap(regions, this);
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
        if (!this.map) throw new Error("Scene has not been properly initialized yet");
        this.map.regions.forEach((r) => {
            let cityData = City.toCityData(r.city);
            cityDataList.push(cityData);
        }); 
        return cityDataList;
    }

    // A bunch of spaghetti. Controls which cities are selected
    // as the origin and destination for a troop movement
    // and if both are selected, initiates movement,
    // then deselects them.
    override manageSelection(city: City, e: FederatedPointerEvent) {
        if (this.originSelection === undefined) {
            if (city.ownerId == this.sceneManager?.networkManager.socket?.id) {
                this.originSelection = city;
                city.selectAs("origin");
            }
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