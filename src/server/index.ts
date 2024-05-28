import express from 'express';
import { Server, Socket } from 'socket.io';
import http from "http";
import path from "path";
import { Vector2 } from '../client/Utils/Vector2';
import { CityData, Client, Command, GameState } from '../client/Utils/Communication';
import { GameParameters as Params } from '../client/Utils/GameParameters';
import Initializer from './Initializer';

const port: number = 3000;

export class App {
    port: number;

    io: Server;
    clients: Client[] = [];
    cityDataList: CityData[] = [];
    initializer: Initializer;

    clientLoopAwake: boolean = false;

    constructor(port: number) {
        this.port = port;
        this.initializer = new Initializer(this);

        // Start server
        this.io = this.initializer.initServer();
        
        // Set up world
        this.cityDataList = this.initializer.generateCities(Params.numberOfCities);

        // Start client update loop
        setInterval(this.updateClientsWithGameState.bind(this), Params.serverClientUpdateInterval);

        this.io.on("connection", (socket: Socket) => {
            console.log("Client with id " + socket.id.toString() + "has connected.");
            this.initializer.initializeClient(socket);

            socket.on("clientGameState", this.reconcileClientGameState.bind(this));
            socket.on("pendingClientCommands", this.reconcileClientCommands.bind(this));

            // Dev mode only ofc
            socket.on("resetServer", () => {
                //TODO
                console.log("Not set up yet");
            });

            socket.on("disconnect", () => {
                console.log("Client with id " + socket.id.toString() + "has disconnected.");
            });
        });
    }

    // Core loop to send game state info to clients
    updateClientsWithGameState() {
        this.updateCityTroops();

        let gameState: GameState = {
            cityDataList: this.cityDataList,
            troopDataList: [],
            creationTime: Date.now(),
        };
        this.io.emit("updateGameState", gameState);

        if (!this.clientLoopAwake) this.clientLoopAwake = true;
    }

    updateCityTroops() {
        
        let now = Date.now();

        this.cityDataList.forEach((cityData, i, arr) => {
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
            if (!this.clientLoopAwake) {
                arr[i].lastSpawnTime = now;
                arr[i].lastTroopIncreaseTime = now;
                arr[i].lastTroopDamageTime = now;
            }

            if (cityData.troopCount <= 1) {
                cityData.troopSendNumber = 0;
            }

            // Decrease the amount of troops if we're sending them out
            if (cityData.troopSendNumber > 0) {
                if (now - cityData.lastSpawnTime! > Params.troopSpawnInterval
                && cityData.ownerId && cityData.destinationId) {
                    
                    arr[i].troopCount -= 1;
                    arr[i].lastSpawnTime = now;
                }
            } else { // Otherwise, increase them at regen speed if not being damaged
                if (now - cityData.lastTroopIncreaseTime! > Params.troopIncreaseInterval &&
                    cityData.troopCount < (cityData.ownerId ? Params.maxTroopCount : Params.maxTroopCountUnowned) &&
                    now - cityData.lastTroopDamageTime! > Params.damageRecoveryTime) {

                    arr[i].troopCount += 1;
                    arr[i].lastTroopIncreaseTime = now;
                }
            }
        });
    }


    reconcileClientGameState({clientId, clientGameState}: {clientId: string, clientGameState: GameState}) {
            // This is no good for security but for now this will be used
            // to impose things that the client tells us during update time
            // For now, just imposing the times that cities were last damaged
            // according to the clients.

            this.cityDataList.forEach((cityData, idx, arr) => {
                let cccd = clientGameState.cityDataList.find((ccd) => {
                    return ccd.id == cityData.id;
                });

                if (!cccd) throw new Error("Client game state does not match server game state");
                
                // And we're taking the damager's word, so only sync if the last owner of the last
                // damaging troop is the same as the client

                if (cccd.ownerIdOfLastDamagingTroop == clientId) {
                    arr[idx].lastTroopDamageTime = cccd.lastTroopDamageTime;
                    arr[idx].ownerIdOfLastDamagingTroop = cccd.ownerIdOfLastDamagingTroop;

                    // If this city has recently been damaged, also take client's word for how many
                    // troops it has

                    if (cccd.lastTroopDamageTime
                    && clientGameState.creationTime - cccd.lastTroopDamageTime 
                    < Params.damageRecoveryTime) {
    
                        arr[idx].troopCount = cccd.troopCount;
                    }
                }
            });
    }

    reconcileClientCommands(clientCommands: Command[]) {
        // Directly modifies server's game state with client's commands from last loop
        // No protection for now
        clientCommands.forEach((command) => {
			let originIndex = this.cityDataList.findIndex((cd) => {return cd.id == command.originId});

			this.cityDataList[originIndex].troopSendNumber = command.troopCount;
			this.cityDataList[originIndex].destinationId = command.destinationId;

            // also needs to tell server about destination getting reduced
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
