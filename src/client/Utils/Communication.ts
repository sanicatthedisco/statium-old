import { Vector2 } from "./Vector2";

export interface CityData {
    id: number;
    x: number;
    y: number;
    ownerId?: string;
    troopCount: number;
    troopSendNumber: number;
    destinationId: number | undefined;
    lastSpawnTime?: number;
    lastTroopIncreaseTime?: number;
    lastTroopDamageTime?: number;
    ownerIdOfLastDamagingTroop?: string;
    lastSentTroop?: TroopData;
}

export interface TroopData {
    destinationId: number;
    dirVector: Vector2;
    ownerId: string;
    creationTime: number;
    x: number;
    y: number;
}

export interface Client {
    slot: number;
    id: string;
    isOwner: boolean;
}

export interface GameState {
    cityDataList: CityData[];
    troopDataList?: TroopData[]; // might get rid of
    creationTime: number;
}

export interface Command {
    originId: number,
    destinationId: number,
    troopCount: number
}