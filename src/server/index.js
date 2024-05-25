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
var port = 3000;
var App = /** @class */ (function () {
    function App(port) {
        var _this = this;
        this.clients = [];
        this.currentHighestSlot = 0;
        this.cityDataList = [];
        this.cityRadius = 20;
        this.cityPadding = 20;
        this.cityNumber = 10;
        this.emitGameStateInterval = 100; // ms
        this.port = port;
        // Start server
        var app = (0, express_1.default)();
        app.use(express_1.default.static(path_1.default.join(__dirname, 'dist/client')));
        this.server = http_1.default.createServer(app);
        this.io = new socket_io_1.Server(this.server);
        // Set up world
        this.generateCities(this.cityNumber);
        // Client update loop
        setInterval(function () {
            var now = Date.now();
            if (!_this.lastSpawnTime)
                _this.lastSpawnTime = now;
            if (now - _this.lastSpawnTime > GameParameters_1.GameParameters.troopSpawnInterval) {
                _this.lastSpawnTime = now;
                _this.cityDataList.forEach(function (cityData, i, arr) {
                    if (cityData.troopCount < GameParameters_1.GameParameters.maxTroopCount)
                        arr[i].troopCount += 1;
                });
            }
            var gameState = {
                cityDataList: _this.cityDataList,
            };
            _this.io.emit("updateGameState", gameState);
        }, this.emitGameStateInterval); // Start client update loop
        this.io.on("connection", function (socket) {
            console.log("Client with id " + socket.id.toString() + "has connected.");
            _this.initializeClient(socket);
            socket.on("pendingClientCommands", function (clientCommands) {
                _this.reconcileClientCommands(clientCommands);
            });
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
    App.prototype.reconcileClientCommands = function (clientCommands) {
        var _this = this;
        // Directly modifies server's game state with client's commands from last loop
        // No protection for now
        clientCommands.forEach(function (command) {
            var originIndex = _this.cityDataList.findIndex(function (cd) { return cd.id == command.originId; });
            _this.cityDataList[originIndex].troopSendNumber = command.troopCount;
            _this.cityDataList[originIndex].destinationId = command.destinationId;
            // also needs to tell server about destination getting reduced
        });
    };
    App.prototype.initializeClient = function (socket) {
        // Initialize client id & let everyone know
        this.currentHighestSlot += 1;
        this.clients.push({
            slot: this.currentHighestSlot,
            id: socket.id
        });
        this.io.emit("clientUpdate", this.clients);
        socket.emit("initializeWorld", this.cityDataList);
        // Give this client a starting city and let everyone know
        // Find a city which isn't taken already
        var clientAssignedCity;
        do {
            clientAssignedCity = this.randomChoice(this.cityDataList);
        } while (clientAssignedCity.ownerId != undefined);
        clientAssignedCity.ownerId = socket.id;
        clientAssignedCity.ownerSlot = this.currentHighestSlot;
    };
    App.prototype.cityIntersectsOther = function (cityToCheck) {
        for (var _i = 0, _a = this.cityDataList; _i < _a.length; _i++) {
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
                city = { id: i, x: x, y: y, ownerId: undefined, troopCount: 0, troopSendNumber: 0, destinationId: undefined };
            } while (this.cityIntersectsOther(city));
            // Once it's been found, add this city to the list of cities
            this.cityDataList.push(city);
        }
    };
    App.prototype.randomChoice = function (array) {
        return array[Math.floor(Math.random() * array.length)];
    };
    return App;
}());
new App(port).Start();
