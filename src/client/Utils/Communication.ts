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
}

export interface Client {
    slot: number;
    id: string;
}

export interface GameState {
    cityDataList: CityData[];
    creationTime: number;
}

export interface Command {
    originId: number,
    destinationId: number,
    troopCount: number
}