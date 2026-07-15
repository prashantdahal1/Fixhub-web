import { type Request, type Response } from "express";
import { ServiceService } from "../services/service.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import type { ServiceCategory } from "../models/service.model.js";

const serviceService = new ServiceService();

export class ServiceController {
  async getServices(req: Request, res: Response) {
    try {
      const category = req.query.category as ServiceCategory | undefined;
      const search = req.query.search as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;

      const result = await serviceService.getServices({ category, search, page, limit });

      return ApiResponseHelper.success(res, result.data, "Services fetched successfully", 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async getServiceById(req: Request, res: Response) {
    try {
      const service = await serviceService.getServiceById(req.params.id);
      return ApiResponseHelper.success(res, service, "Service fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async getServiceBySlug(req: Request, res: Response) {
    try {
      const service = await serviceService.getServiceBySlug(req.params.slug);
      return ApiResponseHelper.success(res, service, "Service fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async createService(req: Request, res: Response) {
    try {
      const data = { ...req.body };
      if ((req as any).user) {
        data.professionalId = (req as any).user.id;
      }
      if (req.file) {
        data.imageUrl = `/uploads/documents/${req.file.filename}`;
      }
      const service = await serviceService.createService(data);
      return ApiResponseHelper.success(res, service, "Service created successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async updateService(req: Request, res: Response) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.imageUrl = `/uploads/documents/${req.file.filename}`;
      }
      const service = await serviceService.updateService(req.params.id, data);
      return ApiResponseHelper.success(res, service, "Service updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async deleteService(req: Request, res: Response) {
    try {
      await serviceService.deleteService(req.params.id);
      return ApiResponseHelper.success(res, null, "Service deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }
}
