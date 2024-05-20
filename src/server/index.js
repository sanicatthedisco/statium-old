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
var port = 3000;
var App = /** @class */ (function () {
    function App(port) {
        var _this = this;
        this.clients = [];
        this.currentHighestSlot = 0;
        this.cityData = [];
        this.cityRadius = 20;
        this.cityPadding = 20;
        this.cityNumber = 10;
        this.port = port;
        // Start server
        var app = (0, express_1.default)();
        app.use(express_1.default.static(path_1.default.join(__dirname, 'dist/client')));
        this.server = http_1.default.createServer(app);
        this.io = new socket_io_1.Server(this.server);
        // Set up world
        this.generateCities(this.cityNumber);
        // Client communication
        this.io.on("connection", function (socket) {
            console.log("Client with id " + socket.id.toString() + "has connected.");
            // Initialize client
            _this.currentHighestSlot += 1;
            _this.clients.push({
                slot: _this.currentHighestSlot,
                id: socket.id
            });
            _this.io.emit("clientUpdate", _this.clients);
            socket.emit("initializeWorld", _this.cityData);
            // Give this client a starting city and let everyone know
            // Find a city which isn't taken already
            var clientAssignedCity;
            do {
                clientAssignedCity = _this.randomChoice(_this.cityData);
            } while (clientAssignedCity.ownerId != undefined);
            clientAssignedCity.ownerId = socket.id;
            clientAssignedCity.ownerSlot = _this.currentHighestSlot;
            _this.io.emit("cityUpdate", clientAssignedCity);
            socket.on("disconnect", function () {
                console.log("Client with id " + socket.id.toString() + "has disconnected.");
            });
        });
    }
    App.prototype.Start = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log("Server listening on port " + _this.port);
        });
    };
    App.prototype.cityIntersectsOther = function (cityToCheck) {
        for (var _i = 0, _a = this.cityData; _i < _a.length; _i++) {
            var city = _a[_i];
            if (cityToCheck != city) {
                var dist = Vector2_1.Vector2.Subtract(new Vector2_1.Vector2(cityToCheck.x, cityToCheck.y), new Vector2_1.Vector2(city.x, city.y)).magnitude();
                if (dist < this.cityRadius + this.cityPadding) {
                    return true;
                }
            }
        }
        return false;
    };
    App.prototype.generateCities = function (quantity) {
        // Create a number of ServerCity instances
        for (var i = 0; i < quantity; i++) {
            var city = void 0;
            // Generate possible positions until once is found that doesn't overlap with another city
            do {
                var x = Math.random() * 600 + 10;
                var y = Math.random() * 420 + 10;
                city = { id: i, x: x, y: y, ownerId: undefined };
            } while (this.cityIntersectsOther(city));
            // Once it's been found, add this city to the list of cities
            this.cityData.push(city);
        }
    };
    App.prototype.randomChoice = function (array) {
        return array[Math.floor(Math.random() * array.length)];
    };
    return App;
}());
new App(port).Start();
