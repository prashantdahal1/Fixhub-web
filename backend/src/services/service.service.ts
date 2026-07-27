import { ServiceMongoRepository, type ServiceQuery } from "../repositories/service.repository.js";
import fs from 'fs';
import path from 'path';
import type { IService } from "../models/service.model.js";
import { ServiceImageDeletionModel } from "../models/service-image-deletion.model.js";
import { HttpException } from "../exceptions/http-exception.js";
import { broadcastRealtimeEvent } from "../utils/realtime.util.js";
import { logger } from '../utils/logger.js';

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
    const service = await repo.create(payload);
    broadcastRealtimeEvent("service_created", {
      id: service._id.toString(),
      title: service.title,
      slug: service.slug,
      category: service.category,
      isActive: service.isActive,
    });
    return service;
  }

  async updateService(id: string, payload: Partial<IService>, hasImageChange: boolean): Promise<IService> {
    const existing = await repo.findById(id);
    if (!existing) throw new HttpException(404, "Service not found");

    // Determine which new image URLs (if any) are being set
    const newFiles = (payload.imageUrls && payload.imageUrls.length > 0)
      ? payload.imageUrls
      : payload.imageUrl
      ? [payload.imageUrl]
      : [];

    // Attempt DB update first. If it fails, rollback by removing newly uploaded files.
    let updated = null as IService | null;
    try {
      updated = await repo.update(id, payload);
    } catch (err) {
      // rollback newly saved files to avoid orphaned files
      try {
        for (const imageUrl of newFiles) {
          if (!imageUrl) continue;
          if (imageUrl.startsWith('/uploads/')) {
            const filename = path.basename(imageUrl);
            const filePath = path.join(process.cwd(), 'uploads', 'documents', filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }
        }
      } catch (cleanupErr) {
        logger.warn('Failed to rollback uploaded files after update failure', cleanupErr);
      }
      throw err;
    }

    if (!updated) throw new HttpException(404, "Service not found");

    if (hasImageChange) {
      // After successful update, remove old files that are not part of the new set
      try {
        await this.cleanupServiceFiles(existing, newFiles);
      } catch (cleanupErr) {
        logger.warn('Failed to cleanup old service files', cleanupErr);
      }
    }

    broadcastRealtimeEvent("service_updated", {
      id: updated._id.toString(),
      title: updated.title,
      slug: updated.slug,
      category: updated.category,
      isActive: updated.isActive,
    });
    return updated;
  }

  async deleteService(id: string): Promise<void> {
    const existing = await repo.findById(id);
    if (!existing) throw new HttpException(404, "Service not found");
    await this.cleanupServiceFiles(existing);
    const deleted = await repo.remove(id);
    if (!deleted) throw new HttpException(404, "Service not found");
    broadcastRealtimeEvent("service_deleted", { id });
  }

  async deleteServiceImage(id: string, deletedBy?: string): Promise<void> {
    const service = await repo.findById(id);
    if (!service) throw new HttpException(404, 'Service not found');

    await this.cleanupServiceFiles(service);
    await repo.update(id, { imageUrl: '', imageUrls: [] });

    const oldImageUrl = service.imageUrl || '';
    // record deletion log
    try {
      await ServiceImageDeletionModel.create({
        serviceId: service._id,
        ...(deletedBy ? { deletedBy } : {}),
        oldImageUrl: oldImageUrl || '',
        filename: path.basename(oldImageUrl) || '',
      });
    } catch (err) {
      console.warn('Failed to write service image deletion log', err);
    }
  }

  private async cleanupServiceFiles(service: IService, keepUrls: string[] = []): Promise<void> {
    const urls = [
      ...(Array.isArray(service.imageUrls) ? service.imageUrls : []),
      service.imageUrl || '',
    ]
      .filter((url) => !!url) as string[];

    for (const imageUrl of urls) {
      if (keepUrls.includes(imageUrl)) continue;
      if (imageUrl.startsWith('/uploads/')) {
        const filename = path.basename(imageUrl);
        const filePath = path.join(process.cwd(), 'uploads', 'documents', filename);
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
          console.warn('Failed to remove service image file', err);
        }
      }
    }
  }
}
