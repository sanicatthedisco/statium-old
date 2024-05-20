import { Socket, io } from "socket.io-client";
import { SceneManager } from "../Scenes/SceneManager";
import { MainScene } from "../Scenes/MainScene";

export interface CityData {
    id: number;
    x: number;
    y: number;
    ownerId?: string;
    ownerSlot?: number;
}

interface Client {
    slot: number;
    id: string;
}

export class NetworkManager {
	socket: Socket;
	clients: Client[] = [];
	sceneManager!: SceneManager;

	constructor() {
		this.socket = io();

		this.socket.on("connect", () => {
			console.log("Connected");
		});
		this.socket.on("disconnect", () => {
			console.log("Disconnected");
		});

		this.socket.on("clientUpdate", (clients) => {
			this.clients = clients;
		});

		this.socket.on("cityUpdate", (cityData: CityData) => {
			if (this.sceneManager.activeScene instanceof MainScene) {
				this.sceneManager.activeScene.updateCity(cityData);
			} else {
				console.error("World is being initialized but client does not have main scene loaded!");
			}
		});

		this.socket.on("initializeWorld", (cityData) => {
			if (this.sceneManager.activeScene instanceof MainScene) {
				this.sceneManager.activeScene.initializeCities(cityData);
			} else {
				console.error("World is being initialized but client does not have main scene loaded!");
			}
		});
	}
 
	getClientSlot(clientId: string) {
		return this.clients.find((client) => {
			return client.id == clientId;
		})?.slot;
	}
}