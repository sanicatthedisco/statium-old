export interface CityData {
    id: number;
    x: number;
    y: number;
    ownerId?: string;
    ownerSlot?: number;
    troopCount: number;
}

export interface Client {
    slot: number;
    id: string;
}