"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
var GameParameters_1 = require("../client/Utils/GameParameters");
var Initializer_1 = __importDefault(require("./Initializer"));
var port = 3000;
var App = /** @class */ (function () {
    function App(port) {
        var _this = this;
        this.clients = [];
        this.cityDataList = [];
        this.clientLoopAwake = false;
        this.port = port;
        this.initializer = new Initializer_1.default(this);
        // Start server
        this.io = this.initializer.initServer();
        // Set up world
        this.cityDataList = this.initializer.generateCities(GameParameters_1.GameParameters.numberOfCities);
        // Start client update loop
        setInterval(this.updateClientsWithGameState.bind(this), GameParameters_1.GameParameters.serverClientUpdateInterval);
        this.io.on("connection", function (socket) {
            console.log("Client with id " + socket.id.toString() + "has connected.");
            _this.initializer.initializeClient(socket);
            socket.on("clientGameState", _this.reconcileClientGameState.bind(_this));
            socket.on("pendingClientCommands", _this.reconcileClientCommands.bind(_this));
            // Dev mode only ofc
            socket.on("resetServer", function () {
                //TODO
                console.log("Not set up yet");
            });
            socket.on("disconnect", function () {
                console.log("Client with id " + socket.id.toString() + "has disconnected.");
            });
        });
    }
    // Core loop to send game state info to clients
    App.prototype.updateClientsWithGameState = function () {
        this.updateCityTroops();
        var gameState = {
            cityDataList: this.cityDataList,
            creationTime: Date.now(),
        };
        this.io.emit("updateGameState", gameState);
        if (!this.clientLoopAwake)
            this.clientLoopAwake = true;
    };
    App.prototype.updateCityTroops = function () {
        var _this = this;
        var now = Date.now();
        this.cityDataList.forEach(function (cityData, i, arr) {
            // If troops are zero, change owner
            if (cityData.troopCount <= 0) {
                if (!cityData.ownerIdOfLastDamagingTroop)
                    throw new Error("Damaging troop has no owner or an undamaged city has fallen below 0 troops");
                arr[i].ownerId = cityData.ownerIdOfLastDamagingTroop;
                arr[i].troopSendNumber = 0;
                arr[i].troopCount = 0;
                arr[i].ownerIdOfLastDamagingTroop = undefined;
            }
            // Keeping track of spawn times for each individual city
            if (!_this.clientLoopAwake) {
                arr[i].lastSpawnTime = now;
                arr[i].lastTroopIncreaseTime = now;
                arr[i].lastTroopDamageTime = now;
            }
            if (cityData.troopCount <= 1) {
                cityData.troopSendNumber = 0;
            }
            // Decrease the amount of troops if we're sending them out
            if (cityData.troopSendNumber > 0) {
                if (now - cityData.lastSpawnTime > GameParameters_1.GameParameters.troopSpawnInterval
                    && cityData.ownerId && cityData.destinationId) {
                    arr[i].troopCount -= 1;
                    arr[i].lastSpawnTime = now;
                }
            }
            else { // Otherwise, increase them at regen speed if not being damaged
                if (now - cityData.lastTroopIncreaseTime > GameParameters_1.GameParameters.troopIncreaseInterval &&
                    cityData.troopCount < (cityData.ownerId ? GameParameters_1.GameParameters.maxTroopCount : GameParameters_1.GameParameters.maxTroopCountUnowned) &&
                    now - cityData.lastTroopDamageTime > GameParameters_1.GameParameters.damageRecoveryTime) {
                    arr[i].troopCount += 1;
                    arr[i].lastTroopIncreaseTime = now;
                }
            }
        });
    };
    App.prototype.reconcileClientGameState = function (_a) {
        // This is no good for security but for now this will be used
        // to impose things that the client tells us during update time
        // For now, just imposing the times that cities were last damaged
        // according to the clients.
        var clientId = _a.clientId, clientGameState = _a.clientGameState;
        this.cityDataList.forEach(function (cityData, idx, arr) {
            var cccd = clientGameState.cityDataList.find(function (ccd) {
                return ccd.id == cityData.id;
            });
            if (!cccd)
                throw new Error("Client game state does not match server game state");
            // And we're taking the damager's word, so only sync if the last owner of the last
            // damaging troop is the same as the client
            if (cccd.ownerIdOfLastDamagingTroop == clientId) {
                arr[idx].lastTroopDamageTime = cccd.lastTroopDamageTime;
                arr[idx].ownerIdOfLastDamagingTroop = cccd.ownerIdOfLastDamagingTroop;
                // If this city has recently been damaged, also take client's word for how many
                // troops it has
                if (cccd.lastTroopDamageTime
                    && clientGameState.creationTime - cccd.lastTroopDamageTime
                        < GameParameters_1.GameParameters.damageRecoveryTime) {
                    arr[idx].troopCount = cccd.troopCount;
                }
            }
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
    App.prototype.getSlotOfClient = function (clientId) {
        var correspondingClient = this.clients.find(function (client) {
            return client.id == clientId;
        });
        if (correspondingClient)
            return correspondingClient.slot;
        else
            throw new Error("No client exists with that id!");
    };
    return App;
}());
exports.App = App;
new App(port).initializer.Start();
