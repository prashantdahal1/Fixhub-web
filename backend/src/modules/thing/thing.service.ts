import { thingRepository } from './thing.repository.js';
import type { CreateThingDTO } from '../../dtos/thing.dto.js';

export class ThingService {
    async createThing(dto: CreateThingDTO, userId?: string) {
        const created = await thingRepository.createThing(userId ? { ...dto, createdBy: userId } : dto);
        return created;
    }

    async getThingById(id: string) {
        return await thingRepository.getById(id);
    }
}

export const thingService = new ThingService();
