"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var socket_io_1 = require("socket.io");
var http_1 = __importDefault(require("http"));
var path_1 = __importDefault(require("path"));
var Vector2_1 = require("../client/Utils/Vector2");
var GameParameters_1 = require("../client/Utils/GameParameters");
var Initializer = /** @class */ (function () {
    function Initializer(app) {
        this.currentHighestSlot = 0;
        this.app = app;
    }
    Initializer.prototype.Start = function () {
        var _this = this;
        if (!this.server)
            throw new Error("Server has not been initialized!");
        this.server.listen(this.app.port, function () {
            console.log("Server listening on port " + _this.app.port);
        });
    };
    Initializer.prototype.initServer = function () {
        var app = (0, express_1.default)();
        app.use(express_1.default.static(path_1.default.join(__dirname, 'dist/client')));
        this.server = http_1.default.createServer(app);
        return new socket_io_1.Server(this.server);
    };
    Initializer.prototype.initializeClient = function (socket) {
        // Initialize client id & let everyone know
        this.currentHighestSlot += 1;
        this.app.clients.push({
            slot: this.currentHighestSlot,
            id: socket.id
        });
        this.app.io.emit("clientUpdate", this.app.clients);
        socket.emit("initializeWorld", this.app.cityDataList);
        // Give this client a starting city and let everyone know
        // Find a city which isn't taken already
        var clientAssignedCity;
        do {
            clientAssignedCity = this.randomChoice(this.app.cityDataList);
        } while (clientAssignedCity.ownerId != undefined);
        clientAssignedCity.ownerId = socket.id;
        clientAssignedCity.troopCount += 20;
    };
    Initializer.prototype.cityIntersectsOther = function (cityToCheck) {
        var intersects = false;
        this.app.cityDataList.forEach(function (city) {
            if (cityToCheck != city) {
                var dist = Vector2_1.Vector2.Subtract(new Vector2_1.Vector2(cityToCheck.x, cityToCheck.y), new Vector2_1.Vector2(city.x, city.y)).magnitude();
                if (dist < GameParameters_1.GameParameters.cityRadius + GameParameters_1.GameParameters.cityMargin) {
                    intersects = true;
                }
            }
        });
        return intersects;
    };
    Initializer.prototype.generateCities = function (quantity) {
        // Create a number of ServerCity instances
        var cities = [];
        for (var i = 0; i < quantity; i++) {
            var city = void 0;
            // Generate possible positions until once is found that doesn't overlap with another city
            do {
                var x = Math.random() * 600 + 10;
                var y = Math.random() * 420 + 10;
                city = { id: i, x: x, y: y, ownerId: undefined, troopCount: 1, troopSendNumber: 0,
                    destinationId: undefined };
            } while (this.cityIntersectsOther(city));
            // Once it's been found, add this city to the list of cities
            cities.push(city);
        }
        return cities;
    };
    Initializer.prototype.randomChoice = function (array) {
        return array[Math.floor(Math.random() * array.length)];
    };
    Initializer.prototype.resetServer = function () {
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
    };
    return Initializer;
}());
exports.default = Initializer;
