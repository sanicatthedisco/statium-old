import express from 'express';
import { Server, Socket } from 'socket.io';
import http from "http";
import path from "path";
import { Vector2 } from '../client/Utils/Vector2';
import { CityData, Client, Command, GameState } from '../client/Utils/Communication';
import { GameParameters as Params } from '../client/Utils/GameParameters';
import Initializer from './Initializer';
import { GameSimulator } from './Simulator';

const port: number = +(process.env.PORT || 5001);

let prod = false;
if (process.argv[2] == "--prod") {
    prod = true;
    console.log("Running server in production mode");
}

export class App {
    port: number;

    io: Server;
    clients: Client[] = [];
    initializer: Initializer;
    simulator: GameSimulator;

    pendingClientCommands: Command[] = [];

    constructor(port: number) {
        this.port = port;
        this.initializer = new Initializer(this, prod);

        // Start server
        this.io = this.initializer.initServer();
        
        // Set up world
        let cdl = this.initializer.generateCities(Params.numberOfCities);
        this.simulator = new GameSimulator(cdl);

        // Start client update loop
        setInterval(this.updateClientsWithGameState.bind(this), Params.serverClientUpdateInterval);

        // Start game state simulation loop
        setInterval(() => {
            this.simulator.stepForwardTo(Date.now());
        }, Params.simulationStepInterval);

        console.log("Game state simulation started");

        this.io.on("connection", this.handleConnection.bind(this));
    }

    handleConnection(socket: Socket) {
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
}

new App(port).initializer.Start();
