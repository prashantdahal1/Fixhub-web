import { thingRepository } from '../repositories/thing.repository.js';
import type { CreateThingDTO } from '../dtos/thing.dto.js';

export class ThingService {
    async createThing(dto: CreateThingDTO, userId?: string) {
        const created = await thingRepository.createThing({ ...dto, createdBy: userId });
        return created;
    }

    async getThingById(id: string) {
        return await thingRepository.getById(id);
    }
}

export const thingService = new ThingService();
