import { Socket, io } from "socket.io-client";
import { SceneManager } from "../Scenes/SceneManager";
import { MainScene } from "../Scenes/MainScene";
import { CityData, Client, Command, GameState } from "../Utils/Communication";
import { City } from "../GameObjects/City";
import { GameParameters as Params } from "../Utils/GameParameters";
import NewGameMenuScene from "../Scenes/Menus/NewGameMenuScene";
import JoinGameMenuScene from "../Scenes/Menus/JoinGameMenuScene";

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

		this.socket.on("lobbyCreationResult", (result) => {
			if (result.succeeded) {
				this.sceneManager.setScene(new MainScene());
			} else {
				if (!(this.sceneManager.activeScene instanceof NewGameMenuScene))
					throw new Error("Should not be getting lobby creation result on this scene.");

				(this.sceneManager.activeScene as NewGameMenuScene).fail();
			}
		});
		this.socket.on("lobbyJoinResult", (result) => {
			if (result.succeeded) {
				this.sceneManager.setScene(new MainScene());
			} else {
				if (!(this.sceneManager.activeScene instanceof JoinGameMenuScene))
					throw new Error("Should not be getting lobby join result on this scene.");

				(this.sceneManager.activeScene as JoinGameMenuScene).fail();
			}
		})

		this.socket.on("clientUpdate", (clients) => {
			this.clients = clients;
		});

		this.socket.on("initializeWorld", (cityData) => {
			if (this.sceneManager.activeScene instanceof MainScene) {
				this.sceneManager.activeScene.initializeCities(cityData);
			} else {
				throw new Error("World is being initialized but client does not have main scene loaded!");
			}
		});

		// When the server sends us its game state to be imposed
		this.socket.on("updateGameState", (serverGameState) => {
			let reconciledGameStates = this.reconcileGameStates(serverGameState, this.getGameState());
			this.sceneManager.imposeGameState(reconciledGameStates);

			this.socket!.emit("clientGameState", {
				clientId: this.socket!.id, 
				clientGameState: reconciledGameStates
			});

			this.socket!.emit("pendingClientCommands", this.commandBuffer);
			this.commandBuffer = [];
		});
	}

	requestLobbyCreation(lobbyId: string) {
		this.socket?.emit("requestLobbyCreation", lobbyId);
	}
	requestLobbyJoin(lobbyId: string) {
		this.socket?.emit("requestLobbyJoin", lobbyId);
	}

	getGameState(): GameState {
		if (this.sceneManager.activeScene instanceof MainScene) {
			return {
				cityDataList: this.sceneManager.activeScene.getCityDataList(),
				creationTime: Date.now(),
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

		// Also impose client's last damage times and troopcounts, for now, for damage that they've done
		reconciledGameState.cityDataList.forEach((cityData, idx, arr) => {
			let correspondingClientCityData = clientGameState.cityDataList.find((cd) => {
				return cd.id == cityData.id;
			});

			// Only impose damage that this client has done!
			if (correspondingClientCityData?.ownerIdOfLastDamagingTroop == this.socket?.id) {
				arr[idx].lastTroopDamageTime = correspondingClientCityData?.lastTroopDamageTime;
				arr[idx].ownerIdOfLastDamagingTroop = correspondingClientCityData?.ownerIdOfLastDamagingTroop;

				// And if this damage is recent, also impose the damager's troopcount for it
				if (correspondingClientCityData?.lastTroopDamageTime &&
					Date.now() - correspondingClientCityData?.lastTroopDamageTime < Params.damageRecoveryTime) {
						arr[idx].troopCount = correspondingClientCityData?.troopCount;
				}
			}
		});

		return reconciledGameState;
	}
 
	getClientSlot(clientId: string): number {
		let correspondingClient = this.clients.find((client) => {
			return client.id == clientId;
		})

		if (!correspondingClient) throw new Error("Could not find client with this id");
		return correspondingClient.slot;
	}
}