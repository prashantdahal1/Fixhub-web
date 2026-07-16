import { ServiceMongoRepository, type ServiceQuery } from "../repositories/service.repository.js";
import type { IService } from "../models/service.model.js";
import { HttpException } from "../exceptions/http-exception.js";

const repo = new ServiceMongoRepository();

export class ServiceService {
  async getServices(query: ServiceQuery): Promise<{ data: IService[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 12));
    const result = await repo.findAll({ ...query, page, limit });
    return { ...result, page, limit };
  }

  async getServiceById(id: string): Promise<IService> {
    const service = await repo.findById(id);
    if (!service) throw new HttpException(404, "Service not found");
    return service;
  }

  async getServiceBySlug(slug: string): Promise<IService> {
    const service = await repo.findBySlug(slug);
    if (!service) throw new HttpException(404, "Service not found");
    return service;
  }

  async createService(payload: Partial<IService>): Promise<IService> {
    if (!payload.slug) {
      payload.slug = (payload.title ?? "service")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    return repo.create(payload);
  }

  async updateService(id: string, payload: Partial<IService>): Promise<IService> {
    const updated = await repo.update(id, payload);
    if (!updated) throw new HttpException(404, "Service not found");
    return updated;
  }

  async deleteService(id: string): Promise<void> {
    const deleted = await repo.remove(id);
    if (!deleted) throw new HttpException(404, "Service not found");
  }
}
