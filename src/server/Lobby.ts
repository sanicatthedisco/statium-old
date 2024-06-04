import { CityData, Client, Command } from "../client/Utils/Communication";
import { Vector2 } from "../client/Utils/Vector2";
import App from "./App";
import { GameSimulator } from "./Simulator";
import { GameParameters as Params } from "../client/Utils/GameParameters";
import { Socket } from "socket.io";
import ServerCityRepresentation from "./GameObjectRepresentations/ServerCityRepresentation";

export default class Lobby {
    id: string;
    app: App;

    clients: Client[] = [];
    simulator: GameSimulator;
    pendingClientCommands: Command[] = [];
    currentHighestSlot: number = 0;

    lastPingTime: number = 0;

    timers: NodeJS.Timeout[] = [];

    listeners: {
        socketId: string,
        callback: (...args: any[]) => void, 
        name: string
    }[] = [];

    constructor(id: string, app: App) {
        this.app = app;
        this.id = id;
        
        this.simulator = new GameSimulator(
            this.generateCities(Params.numberOfCities)
        );
    }

    handleConnection(socket: Socket, isOwner=false) {
        console.log("New connection to lobby " + this.id + " by socket " + socket.id);

        // Initialize new client
        this.currentHighestSlot += 1;
        this.clients.push({
            slot: this.currentHighestSlot,
            id: socket.id,
            isOwner: isOwner
        });
        this.app.io.to(this.id).emit("clientUpdate", this.clients);

        // Socket event listeners
        socket.on("pendingClientCommands", (commands) => {
            //console.log("Ping: " + (Date.now() - this.lastPingTime) + " ms");
            this.pendingClientCommands.push(...commands);
        });

        socket.on("disconnect", () => {
            this.leaveLobby(socket);
        });
        socket.on("leaveLobby", () => {
            this.leaveLobby(socket);
        });

        socket.on("requestGameStart", () => {
            // TODO: needs validation
            this.startGame(socket);

        });

        // For convenience return lobby object
        return this;
    }

    startGame(socket: Socket) {
        // Start client update loop
        this.timers.push(setInterval(
            this.updateClientsWithGameState.bind(this), 
            Params.serverClientUpdateInterval
        ));

        // Start game state simulation loop
        this.timers.push(setInterval(() => {
            this.simulator.stepForwardTo(Date.now());
        }, Params.simulationStepInterval));
        console.log("Game state simulation started");

        // Let everyone know the game is starting
        let cityDataList = this.simulator.getGameState().cityDataList;
        this.app.io.to(this.id).emit("gameStart", cityDataList);

        // Give each client a starting city which isn't taken already
        this.clients.forEach((client) => {
            let clientAssignedCity: ServerCityRepresentation;
            do {
                clientAssignedCity = this.randomChoice(this.simulator.cities);
            } while (clientAssignedCity.ownerId != undefined)
            clientAssignedCity.ownerId = client.id;
            clientAssignedCity.troopCount += 20;
        })
    }

    leaveLobby(socket: Socket) {
        console.log("Client with id " + socket.id + " left lobby " + this.id);
        socket.leave(this.id);

        socket.removeAllListeners("requestGameStart");
        socket.removeAllListeners("leaveLobby");
        socket.removeAllListeners("pendingClientCommands");

        // If owner, destroy lobby
        if (this.clients.find(
            (client) => (
                client.id == socket.id
                && client.isOwner
            )
        )) {
            console.log("Lobby destroyed");
            this.timers.forEach((timer) => {clearInterval(timer)});
            socket.to(this.id).emit("lobbyDestroyed"); // Doesn't send to self
            this.app.destroyLobby(this.id);
        }
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

    // Core loop to send game state info to clients
    updateClientsWithGameState() {
        this.reconcileClientCommands(this.pendingClientCommands);
        this.pendingClientCommands = [];
        
        this.app.io.to(this.id).emit("updateGameState", this.simulator.getGameState());
        this.lastPingTime = Date.now();
    }


    reconcileClientCommands(clientCommands: Command[]) {
        // Directly modifies server's game state with client's commands from last loop
        // No protection for now
        clientCommands.forEach((command) => {
            // Need some kind of validation here
			let origin = this.simulator.cities.find((city) => 
                                (city.id == command.originId));
            if (!origin) throw new Error("Command contains nonexistent city id!");
            origin.troopSendNumber = command.troopCount;

            let destination = this.simulator.cities.find((city) => 
                                (city.id == command.destinationId));
            if (!destination) throw new Error("Command contains nonexistent destination id!");
            origin.destination = destination;
		});
    }

    getSlotOfClient(clientId: string): number {
        let correspondingClient = this.clients.find((client) => {
            return client.id == clientId;
        });
        if (correspondingClient) return correspondingClient.slot;
        else throw new Error("No client exists with that id!"); 
    }

    private randomChoice<Type>(array: Type[]) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
}