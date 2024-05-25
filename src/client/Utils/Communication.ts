export interface CityData {
    id: number;
    x: number;
    y: number;
    ownerId?: string;
    ownerSlot?: number;
    troopCount: number;
    troopSendNumber: number;
    destinationId: number | undefined;
}

export interface Client {
    slot: number;
    id: string;
}

export interface GameState {
    cityDataList: CityData[];
}

export interface Command {
    originId: number,
    destinationId: number,
    troopCount: number
}