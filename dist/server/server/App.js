"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const Lobby_1 = __importDefault(require("./Lobby"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
class App {
    constructor(port, production = false) {
        this.lobbies = [];
        this.currentHighestSlot = 0;
        this.clientIndex = "../../client/index.html";
        this.port = port;
        this.production = production;
        // Start server
        this.io = this.initServer();
        this.io.on("connection", this.handleConnection.bind(this));
        setInterval(() => {
            const used = process.memoryUsage();
            console.log("Heap used: " + used.heapUsed / 1024 / 1024 + " MB");
        }, 1000);
    }
    handleConnection(socket) {
        console.log("Client with id " + socket.id.toString() + "has connected.");
        socket.on("requestLobbyCreation", (lobbyId) => {
            let existingLobby = this.lobbies.find((lobby) => (lobby.id == lobbyId));
            if (existingLobby)
                socket.emit("lobbyCreationResult", { succeeded: false });
            else {
                socket.join(lobbyId);
                socket.emit("lobbyCreationResult", { succeeded: true });
                this.lobbies.push(new Lobby_1.default(lobbyId, this).handleConnection(socket, true));
            }
        });
        socket.on("requestLobbyJoin", (lobbyId) => {
            let existingLobby = this.lobbies.find((lobby) => (lobby.id == lobbyId));
            if (!existingLobby)
                socket.emit("lobbyJoinResult", { succeeded: false });
            else {
                socket.join(lobbyId);
                socket.emit("lobbyJoinResult", { succeeded: true });
                existingLobby.handleConnection(socket);
            }
        });
        socket.on("disconnect", () => {
            console.log("Client with id " + socket.id.toString() + "has disconnected.");
        });
    }
    Start() {
        if (!this.server)
            throw new Error("Server has not been initialized!");
        this.server.listen(this.port, () => {
            console.log("Server listening on port " + this.port);
        });
    }
    initServer() {
        const app = (0, express_1.default)();
        app.use(express_1.default.static(path_1.default.join(__dirname, '../../../dist/client')));
        if (this.production)
            app.use((req, res) => res.sendFile(path_1.default.join(__dirname, "../../../dist/client/index.html")));
        this.server = http_1.default.createServer(app);
        return new socket_io_1.Server(this.server);
    }
    destroyLobby(id) {
        this.io.socketsLeave(id);
        this.lobbies.splice(this.lobbies.findIndex((l) => (l.id == id)), 1);
    }
}
exports.default = App;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9BcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx5Q0FBMkM7QUFHM0Msb0RBQTRCO0FBQzVCLHNEQUE4QjtBQUM5QixnREFBd0I7QUFDeEIsZ0RBQXdCO0FBRXhCLE1BQXFCLEdBQUc7SUFhcEIsWUFBWSxJQUFZLEVBQUUsVUFBVSxHQUFDLEtBQUs7UUFSMUMsWUFBTyxHQUFZLEVBQUUsQ0FBQztRQUd0Qix1QkFBa0IsR0FBVyxDQUFDLENBQUM7UUFDL0IsZ0JBQVcsR0FBVyx5QkFBeUIsQ0FBQztRQUs1QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUU3QixlQUFlO1FBQ2YsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFNUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUUzRCxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQTtRQUNwRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsTUFBYztRQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQztRQUV6RSxNQUFNLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLENB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