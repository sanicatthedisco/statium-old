import { Server, Socket } from 'socket.io';
import { Client, Command } from '../shared/Utils/Communication';
import { GameParameters as Params } from '../shared/Utils/GameParameters';
import Lobby from "./Lobby";
import express from 'express';
import http from "http";
import path from "path";

export default class App {
    port: number;

    io: Server;

    lobbies: Lobby[] = [];

    server?: http.Server;
    currentHighestSlot: number = 0;
    clientIndex: string = "../../client/index.html";
    production: boolean;


    constructor(port: number, production=false) {
        this.port = port;
        this.production = production;

        // Start server
        this.io = this.initServer();

        this.io.on("connection", this.handleConnection.bind(this));
    }

    handleConnection(socket: Socket) {
        console.log("Client with id " + socket.id.toString() + "has connected.");

        socket.on("requestLobbyCreation", (lobbyId: string) => {
            let existingLobby = this.lobbies.find(
                (lobby) => (lobby.id == lobbyId)
            );
            if (existingLobby) socket.emit("lobbyCreationResult", {succeeded: false});
            else {
                socket.join(lobbyId);
                socket.emit("lobbyCreationResult", {succeeded: true});
                this.lobbies.push(
                    new Lobby(lobbyId, this).handleConnection(socket, true)
                );
            }
        });
        socket.on("requestLobbyJoin", (lobbyId: string) => {
            let existingLobby = this.lobbies.find(
                (lobby) => (lobby.id == lobbyId)
            );
            if (!existingLobby) socket.emit("lobbyJoinResult", {succeeded: false});
            else {
                socket.join(lobbyId);
                socket.emit("lobbyJoinResult", {succeeded: true});
                existingLobby.handleConnection(socket);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client with id " + socket.id.toString() + "has disconnected.");

            
        });
    }

    public Start() {
        if (!this.server) throw new Error("Server has not been initialized!");
        this.server.listen(this.port, () => {
           console.log("Server listening on port " + this.port); 
        });
    }

    initServer(): Server {
        const app = express();
        app.use(express.static(path.join(__dirname, '../../../dist/client')));
        if (this.production)
            app.use((req, res) => res.sendFile(path.join(__dirname, "../../../dist/client/index.html")));

        this.server = http.createServer(app);
        return new Server(this.server)
    }

    destroyLobby(id: string) {
        this.io.socketsLeave(id);
        this.lobbies.splice(
            this.lobbies.findIndex((l) => (l.id == id)), 1
        );
    }
}