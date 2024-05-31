"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GameParameters_1 = require("../client/Utils/GameParameters");
const Initializer_1 = __importDefault(require("./Initializer"));
const Simulator_1 = require("./Simulator");
class App {
    constructor(port, production = false) {
        this.clients = [];
        this.pendingClientCommands = [];
        this.port = port;
        this.initializer = new Initializer_1.default(this, production);
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
exports.default = App;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9BcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSxtRUFBMEU7QUFDMUUsZ0VBQXdDO0FBQ3hDLDJDQUE0QztBQUc1QyxNQUFxQixHQUFHO0lBWXBCLFlBQVksSUFBWSxFQUFFLFVBQVUsR0FBQyxLQUFLO1FBUjFDLFlBQU8sR0FBYSxFQUFFLENBQUM7UUFJdkIsMEJBQXFCLEdBQWMsRUFBRSxDQUFDO1FBS2xDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxxQkFBVyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVyRCxlQUFlO1FBQ2YsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRXhDLGVBQWU7UUFDZixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQywrQkFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSx5QkFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXhDLDJCQUEyQjtRQUMzQixXQUFXLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSwrQkFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFFM0YsbUNBQW1DO1FBQ25DLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDYixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3QyxDQUFDLEVBQUUsK0JBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRWxDLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsRUFBRSxDQUFDLEVB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