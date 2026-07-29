import { ThingModel, type IThing } from '../../models/thing.model.js';
import type { CreateThingDTO } from '../../dtos/thing.dto.js';

export class ThingMongoRepository {
    async createThing(data: CreateThingDTO & { createdBy?: string }): Promise<IThing> {
        const created = await ThingModel.create(data as any);
        return created;
    }

    async getById(id: string): Promise<IThing | null> {
        return await ThingModel.findById(id).exec();
    }
}

export const thingRepository = new ThingMongoRepository();
