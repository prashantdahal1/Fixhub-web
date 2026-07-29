export interface CreateThingDTO {
    name: string;
    description?: string;
}

export interface ThingResponseDTO {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
}
