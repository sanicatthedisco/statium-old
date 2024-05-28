"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const Vector2_1 = require("../client/Utils/Vector2");
const GameParameters_1 = require("../client/Utils/GameParameters");
class Initializer {
    constructor(app) {
        this.currentHighestSlot = 0;
        this.app = app;
    }
    Start() {
        if (!this.server)
            throw new Error("Server has not been initialized!");
        this.server.listen(this.app.port, () => {
            console.log("Server listening on port " + this.app.port);
        });
    }
    initServer() {
        const app = (0, express_1.default)();
        app.use(express_1.default.static(path_1.default.join(__dirname, 'dist/client')));
        this.server = http_1.default.createServer(app);
        return new socket_io_1.Server(this.server);
    }
    initializeClient(socket) {
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
        let clientAssignedCity;
        do {
            clientAssignedCity = this.randomChoice(this.app.simulator.cities);
        } while (clientAssignedCity.ownerId != undefined);
        clientAssignedCity.ownerId = socket.id;
        clientAssignedCity.troopCount += 20;
    }
    cityIntersectsOther(cityToCheck, cities) {
        let intersects = false;
        cities.forEach((city) => {
            if (cityToCheck.id != city.id) {
                let dist = Vector2_1.Vector2.Subtract(new Vector2_1.Vector2(cityToCheck.x, cityToCheck.y), new Vector2_1.Vector2(city.x, city.y)).magnitude();
                if (dist < GameParameters_1.GameParameters.cityRadius + GameParameters_1.GameParameters.cityMargin) {
                    intersects = true;
                }
            }
        });
        return intersects;
    }
    generateCities(quantity) {
        // Create a number of ServerCity instances
        let cities = [];
        for (let i = 0; i < quantity; i++) {
            let city;
            // Generate possible positions until once is found that doesn't overlap with another city
            do {
                let x = Math.random() * 600 + 10;
                let y = Math.random() * 420 + 10;
                city = { id: i, x: x, y: y, ownerId: undefined, troopCount: 1, troopSendNumber: 0,
                    destinationId: undefined };
            } while (this.cityIntersectsOther(city, cities));
            // Once it's been found, add this city to the list of cities
            cities.push(city);
        }
        return cities;
    }
    randomChoice(array) {
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
exports.default = Initializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5pdGlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmVyL0luaXRpYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQThCO0FBQzlCLHlDQUEyQztBQUMzQyxnREFBd0I7QUFDeEIsZ0RBQXdCO0FBRXhCLHFEQUFrRDtBQUVsRCxtRUFBMEU7QUFHMUUsTUFBcUIsV0FBVztJQUs1QixZQUFZLEdBQVE7UUFIcEIsdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1FBSTNCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFFTSxLQUFLO1FBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsVUFBVTtRQUNOLE1BQU0sR0FBRyxHQUFHLElBQUEsaUJBQU8sR0FBRSxDQUFDO1FBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQU8sQ0FBQyxNQUFNLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTdELElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxPQUFPLElBQUksa0JBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbEMsQ0FBQztJQUVELGdCQUFnQixDQUFDLE1BQWM7UUFDM0IsMkNBQTJDO1FBQzNDLElBQUks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