import { Socket, io } from "socket.io-client";
import { SceneManager } from "../Scenes/SceneManager";
import { MainScene } from "../Scenes/MainScene";
import { CityData, Client, Command, GameState } from "../Utils/Communication";
import { City } from "../GameObjects/City";

export class NetworkManager {
	socket?: Socket;
	clients: Client[] = [];
	sceneManager!: SceneManager;
	commandBuffer: Command[] = [];

	initServerConnection() {
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

		this.socket.on("initializeWorld", (cityData) => {
			if (this.sceneManager.activeScene instanceof MainScene) {
				this.sceneManager.activeScene.initializeCities(cityData);
			} else {
				console.error("World is being initialized but client does not have main scene loaded!");
			}
		});

		this.socket.on("updateGameState", (serverGameState) => {
			this.sceneManager.imposeGameState(
				this.reconcileGameStates(serverGameState, this.getGameState())
			);

			this.socket!.emit("pendingClientCommands", this.commandBuffer);
			this.commandBuffer = [];
		});
	}

	getGameState(): GameState {
		if (this.sceneManager.activeScene instanceof MainScene) {
			return {
				cityDataList: this.sceneManager.activeScene.getCityDataList(),
			};
		} else {
			throw new Error("Haven't implemented other game states yet sorry");
		}
	}

	reconcileGameStates(serverGameState: GameState, clientGameState: GameState): GameState {
		// For any actions in action buffer, synchronize those cities to the local game state
		// For cities which have not been acted on since last server update, impose server state
		let reconciledGameState: GameState = serverGameState;
		this.commandBuffer.forEach((command) => {
			let originIndex = reconciledGameState.cityDataList.findIndex((cd) => {return cd.id == command.originId});
			let destIndex = reconciledGameState.cityDataList.findIndex((cd) => {return cd.id == command.destinationId});

			reconciledGameState.cityDataList[originIndex].troopSendNumber = command.troopCount;
			reconciledGameState.cityDataList[originIndex].destinationId = command.destinationId;
		});

		return reconciledGameState;
	}
 
	getClientSlot(clientId: string) {
		return this.clients.find((client) => {
			return client.id == clientId;
		})?.slot;
	}
}