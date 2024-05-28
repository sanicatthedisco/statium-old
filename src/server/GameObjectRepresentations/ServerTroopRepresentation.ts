import { Server } from "socket.io";
import { Vector2 } from "../../client/Utils/Vector2";
import { CityData, TroopData } from "../../client/Utils/Communication";
import ServerCityRepresentation from "./ServerCityRepresentation";
import { GameParameters as Params } from "../../client/Utils/GameParameters";

export default class ServerTroopRepresentation {
    static highestAssignedId: number = 0;

    id: number;
    ownerId: string;
    creationTime: number;

    dirVector: Vector2;
    position: Vector2;

    destination: ServerCityRepresentation;
    destroyMe = false;

    debugTicker = 0;

    constructor(position: Vector2, destination: ServerCityRepresentation, ownerId: string) {
        this.ownerId = ownerId;
        this.position = position;
        this.destination = destination;

        ServerTroopRepresentation.highestAssignedId ++;
        this.id = ServerTroopRepresentation.highestAssignedId;
        this.creationTime = Date.now();

        this.dirVector = Vector2.Subtract(this.destination.position, this.position);
    }

    update(deltaTime: number) {
        this.dirVector = Vector2.Subtract(this.destination.position, this.position);
        let movementVector = Vector2.Multiply(this.dirVector.norm(), Params.troopSpeed * deltaTime);
        this.position.moveBy(movementVector);

        this.debugTicker += deltaTime;
        if (this.debugTicker > 100) {
            this.debugTicker = 0;
        }

        // Check if intersected target along the way
        if (this.dirVector.magnitude() < Params.cityRadius) {
            this.destination.interactWithTroop(this.ownerId);
            this.destroy();
        }
    }

    destroy() {
        this.destroyMe = true;
    }

    toTroopData(): TroopData {
        return {
            destinationId: this.destination.id,
            dirVector: this.dirVector,
            ownerId: this.ownerId,
            creationTime: this.creationTime,
            x: this.position.x,
            y: this.position.y,
        };
    }
}