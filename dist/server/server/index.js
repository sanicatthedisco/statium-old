"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const GameParameters_1 = require("../client/Utils/GameParameters");
const Initializer_1 = __importDefault(require("./Initializer"));
const Simulator_1 = require("./Simulator");
const port = 3000;
class App {
    constructor(port) {
        this.clients = [];
        this.pendingClientCommands = [];
        this.port = port;
        this.initializer = new Initializer_1.default(this);
        // Start server
        this.io = this.initializer.initServer();
        // Set up world
        let cdl = this.initializer.generateCities(GameParameters_1.GameParameters.numberOfCities);
        this.simulator = new Simulator_1.GameSimulator(cdl);
        // Start client update loop
        setInterval(this.updateClientsWithGameState.bind(this), GameParameters_1.GameParameters.serverClientUpdateInterval);
        // Start game state simulation loop
        setInterval(() => {
            this.simulator.stepForwardTo(Date.now());
        }, GameParameters_1.GameParameters.simulationStepInterval);
        console.log("Game state simulation started");
        this.io.on("connection", this.handleConnection.bind(this));
    }
    handleConnection(socket) {
        console.log("Client with id " + socket.id.toString() + "has connected.");
        this.initializer.initializeClient(socket);
        //socket.on("clientGameState", this.reconcileClientGameState.bind(this));
        socket.on("pendingClientCommands", (commands) => {
            this.pendingClientCommands.push(...commands);
        });
        // Dev mode only ofc
        socket.on("resetServer", () => {
            //TODO
            console.log("Not set up yet");
        });
        socket.on("disconnect", () => {
            console.log("Client with id " + socket.id.toString() + "has disconnected.");
        });
    }
    // Core loop to send game state info to clients
    updateClientsWithGameState() {
        this.reconcileClientCommands(this.pendingClientCommands);
        this.pendingClientCommands = [];
        this.io.emit("updateGameState", this.simulator.getGameState());
    }
    reconcileClientCommands(clientCommands) {
        // Directly modifies server's game state with client's commands from last loop
        // No protection for now
        clientCommands.forEach((command) => {
            // Need some kind of validation here
            let origin = this.simulator.cities.find((city) => (city.id == command.originId));
            if (!origin)
                throw new Error("Command contains nonexistent city id!");
            origin.troopSendNumber = command.troopCount;
            let destination = this.simulator.cities.find((city) => (city.id == command.destinationId));
            if (!destination)
                throw new Error("Command contains nonexistent destination id!");
            origin.destination = destination;
        });
    }
    getSlotOfClient(clientId) {
        let correspondingClient = this.clients.find((client) => {
            return client.id == clientId;
        });
        if (correspondingClient)
            return correspondingClient.slot;
        else
            throw new Error("No client exists with that id!");
    }
}
exports.App = App;
new App(port).initializer.Start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BLG1FQUEwRTtBQUMxRSxnRUFBd0M7QUFDeEMsMkNBQTRDO0FBRTVDLE1BQU0sSUFBSSxHQUFXLElBQUksQ0FBQztBQUUxQixNQUFhLEdBQUc7SUFVWixZQUFZLElBQVk7UUFOeEIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUl2QiwwQkFBcUIsR0FBYyxFQUFFLENBQUM7UUFHbEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHFCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFekMsZUFBZTtRQUNmLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUV4QyxlQUFlO1FBQ2YsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsK0JBQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUkseUJBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV4QywyQkFBMkI7UUFDM0IsV0FBVyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsK0JBQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBRTNGLG1DQUFtQztRQUNuQyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDN0MsQ0FBQyxFQUFFLCtCQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUVsQyxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLEVBQUUsQ0FB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