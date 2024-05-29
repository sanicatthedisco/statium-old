import express from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import path from "path";
import { CityData, Client } from "../client/Utils/Communication";
import { Vector2 } from "../client/Utils/Vector2";
import { App } from ".";
import { GameParameters as Params } from "../client/Utils/GameParameters";
import ServerCityRepresentation from "./GameObjectRepresentations/ServerCityRepresentation";

export default class Initializer {
    server?: http.Server;
    currentHighestSlot: number = 0;
    app: App;
    clientIndex: string = "../../client/index.html";
    prodMode: boolean;

    constructor(app: App, prod=false) {
        this.app = app;
        this.prodMode = prod;
    }

    public Start() {
        if (!this.server) throw new Error("Server has not been initialized!");
        this.server.listen(this.app.port, () => {
           console.log("Server listening on port " + this.app.port); 
        });
    }

    initServer(): Server {
        const app = express();
        app.use(express.static(path.join(__dirname, '../../../dist/client')));
        if (this.prodMode)
            app.use((req, res) => res.sendFile(path.join(__dirname, "../../../dist/client/index.html")));

        this.server = http.createServer(app);
        return new Server(this.server)
    }

    initializeClient(socket: Socket) {
        // Initialize client id & let everyone know
        this.currentHighestSlot += 1;
        this.app.clients.push({
            slot: this.currentHighestSlot,
            id: socket.id
        });

        this.app.io.emit("clientUpdate", this.app.clients);
        let cityDataList = this.app.simulator.getGameState().cityDataList;
        socket.emit("initializeWorld", cityDataList);

        // Give this client a starting city and let everyone know
        // Find a city which isn't taken already
        let clientAssignedCity: ServerCityRepresentation;
        do {
            clientAssignedCity = this.randomChoice(this.app.simulator.cities);
        } while (clientAssignedCity.ownerId != undefined)
        clientAssignedCity.ownerId = socket.id;
        clientAssignedCity.troopCount += 20;
    }

    cityIntersectsOther(cityToCheck: CityData, cities: CityData[]) {
        let intersects = false;

        cities.forEach((city) => {
          if (cityToCheck.id != city.id) {
            let dist = Vector2.Subtract(new Vector2(cityToCheck.x, cityToCheck.y), 
                                        new Vector2(city.x, city.y)).magnitude();
            if (dist < Params.cityRadius + Params.cityMargin) {
                intersects = true;
            }
          }
        });
    
        return intersects;
    }

    generateCities(quantity: number): CityData[] {
        // Create a number of ServerCity instances
        let cities: CityData[] = [];
        for (let i = 0; i < quantity; i ++) {
            let city: CityData;
            
            // Generate possible positions until once is found that doesn't overlap with another city
            do {
            let x = Math.random() * 600 + 10;
            let y = Math.random() * 420 + 10;
            city = {id: i, x: x, y: y, ownerId: undefined, troopCount: 1, troopSendNumber: 0, 
                destinationId: undefined};
            } while (this.cityIntersectsOther(city, cities))
            
            // Once it's been found, add this city to the list of cities
            cities.push(city)
        }
        return cities;
    }

    private randomChoice<Type>(array: Type[]) {
        return array[Math.floor(Math.random() * array.length)];
    }

    resetServer() {
        /*
        this.app.cityDataList = [];
        this.app.clientLoopAwake = false;
        this.app.cityDataList = this.generateCities(Params.numberOfCities);
        
        this.app.io.emit("clientUpdate", this.app.clients);
        this.app.io.emit("initializeWorld", this.app.cityDataList);

        // Give this client a starting city and let everyone know
        // Find a city which isn't taken already
        let clientAssignedCity: CityData;
        do {
            clientAssignedCity = this.randomChoice(this.app.cityDataList);
        } while (clientAssignedCity.ownerId != undefined)
        clientAssignedCity.ownerId = socket.id;

        clientAssignedCity.ownerSlot = this.currentHighestSlot;*/
    }
}