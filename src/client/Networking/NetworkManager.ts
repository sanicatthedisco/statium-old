import { Socket, io } from "socket.io-client";
import { SceneManager } from "../Scenes/SceneManager";
import { MainScene } from "../Scenes/MainScene";
import { CityData, Client, Command, GameState, LobbyResult, WorldInitData } from "../../shared/Utils/Communication";
import { City } from "../GameObjects/City";
import { GameParameters as Params } from "../../shared/Utils/GameParameters";
import NewGameMenuScene from "../Scenes/Menus/NewGameMenuScene";
import JoinGameMenuScene from "../Scenes/Menus/JoinGameMenuScene";
import LobbyStagingScene from "../Scenes/Menus/LobbyStagingScene";

export class NetworkManager {
	socket!: Socket;
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

		this.socket.on("lobbyCreationResult", this.handleLobbyCreationResult.bind(this));
		this.socket.on("lobbyJoinResult", this.handleLobbyJoinResult.bind(this));
		this.socket.on("clientUpdate", this.handleClientUpdate.bind(this));
		this.socket.on("gameStart", this.handleGameStart.bind(this));
		this.socket.on("updateGameState", this.handleGameStateUpdate.bind(this));
	}

	// // Incoming event handling

	// Lobby joining and sending to lobby staging screen
	handleLobbyCreationResult(result: LobbyResult) {
		if (result.succeeded) {
			this.sceneManager.setScene(new LobbyStagingScene(true));
		} else {
			if (!(this.sceneManager.activeScene instanceof NewGameMenuScene))
				throw new Error("Should not be getting lobby creation result on this scene.");

			(this.sceneManager.activeScene as NewGameMenuScene).fail();
		}
	}
	handleLobbyJoinResult(result: LobbyResult) {
		if (result.succeeded) {
			this.sceneManager.setScene(new LobbyStagingScene(false));
		} else {
			if (!(this.sceneManager.activeScene instanceof JoinGameMenuScene))
				throw new Error("Should not be getting lobby join result on this scene.");

			(this.sceneManager.activeScene as JoinGameMenuScene).fail();
		}
	}
	// When a new client joins, the server gives us an updated list of all the clients
	handleClientUpdate(clients: Client[]) {
		this.clients = clients;
		if (this.sceneManager.activeScene instanceof LobbyStagingScene) {
			this.sceneManager.activeScene.updateClients(clients);
		}
	}
	// In the lobby staging scene, the game starts and we transition to the main scene
	handleGameStart(worldInitData: WorldInitData) {
		let main = new MainScene();
		this.sceneManager.setScene(main);
		main.initWorld(worldInitData)
	}
	// When we get an update of the game state from the server, impose that on our own game state
	// Then tell the server about what commands we'd like to send this cycle
	handleGameStateUpdate(serverGameState: GameState) {
		if (!(this.sceneManager.activeScene instanceof MainScene))
			throw new Error("Game state is being updated by server but we are not in a game!");

		let reconciledGameStates = this.reconcileGameStates(serverGameState, this.getGameState());
		this.sceneManager.imposeGameState(reconciledGameStates);

		this.updateServerWithGameState(reconciledGameStates); //TODO: eval if this is still needed
		this.submitPendingCommands();
	}

	// // Outgoing event emission

	updateServerWithGameState(gameState: GameState) {
		this.socket.emit("clientGameState", {
			clientId: this.socket!.id, 
			clientGameState: gameState
		});
	}
	submitPendingCommands() {
		this.socket.emit("pendingClientCommands", this.commandBuffer);
		this.commandBuffer = [];
	}

	leaveLobby() {
		console.log("Leaving lobby");
		this.socket.emit("leaveLobby");
	}
	requestLobbyCreation(lobbyId: string) { this.socket.emit("requestLobbyCreation", lobbyId); }
	requestLobbyJoin(lobbyId: string) { this.socket.emit("requestLobbyJoin", lobbyId); }
	requestGameStart() { this.socket.emit("requestGameStart"); }

	// // Game state control

	//TODO: this needs to be updated because the server can now simulate everything
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

	// Getters / convience methods for lower classes
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
 
	getClientSlot(clientId: string): number {
		let correspondingClient = this.clients.find((client) => {
			return client.id == clientId;
		})

		if (!correspondingClient) throw new Error("Could not find client with this id");
		return correspondingClient.slot;
	}
}