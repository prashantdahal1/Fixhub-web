import { type Request, type Response } from "express";
import { ServiceService } from "../services/service.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { logger } from "../utils/logger.js";
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
      const service = await serviceService.getServiceById(req.params.id as string);
      return ApiResponseHelper.success(res, service, "Service fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async getServiceBySlug(req: Request, res: Response) {
    try {
      const service = await serviceService.getServiceBySlug(req.params.slug as string);
      return ApiResponseHelper.success(res, service, "Service fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async createService(req: Request, res: Response) {
    try {
      const data = { ...req.body } as any;
      // Log incoming request summary to aid debugging multipart/form-data handling
      try {
        const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        logger.info('createService request', {
          user: (req as any).user?.id || null,
          bodyKeys: Object.keys(req.body || {}),
          fileFields: files ? Object.keys(files) : req.file ? ['file'] : [],
        });
      } catch (logErr) {
        logger.warn('Failed to log createService request details', logErr);
      }
      const user = (req as any).user;
      if (user) {
        if (user.role === 'professional') {
          data.professionalId = user.id;
        } else if (user.role === 'admin' && req.body.professionalId) {
          data.professionalId = req.body.professionalId;
        }
      }

      const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadedFiles: Express.Multer.File[] = [];
      if (req.file) uploadedFiles.push(req.file);
      if (files?.image) uploadedFiles.push(...files.image);
      if (files?.images) uploadedFiles.push(...files.images);

      if (uploadedFiles.length > 0) {
        const urls = uploadedFiles.map((file) => `/uploads/documents/${file.filename}`);
        data.imageUrls = urls;
        data.imageUrl = urls[0];
      }

      // Basic validation (industry-standard): required fields
      if (!data.title || !data.description || !data.shortDescription || !data.basePrice || !data.category) {
        return ApiResponseHelper.error(res, 'Missing required service fields: title, description, shortDescription, basePrice, category', 400);
      }

      const service = await serviceService.createService(data);
      return ApiResponseHelper.success(res, service, "Service created successfully", 201);
    } catch (error: any) {
      logger.error(error);
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async updateService(req: Request, res: Response) {
    try {
      const data = { ...req.body } as any;
      // Log incoming request summary to aid debugging multipart/form-data handling
      try {
        const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        logger.info('updateService request', {
          serviceId: req.params.id,
          user: (req as any).user?.id || null,
          bodyKeys: Object.keys(req.body || {}),
          fileFields: files ? Object.keys(files) : req.file ? ['file'] : [],
        });
      } catch (logErr) {
        logger.warn('Failed to log updateService request details', logErr);
      }
      const user = (req as any).user;
      if (user?.role === 'professional') {
        data.professionalId = user.id;
      } else if (user?.role === 'admin' && req.body.professionalId) {
        data.professionalId = req.body.professionalId;
      }

      if (data.professionalId && typeof data.professionalId !== 'string') {
        data.professionalId = typeof data.professionalId._id === 'string'
          ? data.professionalId._id
          : String(data.professionalId);
      }

      const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadedFiles: Express.Multer.File[] = [];
      if (req.file) uploadedFiles.push(req.file);
      if (files?.image) uploadedFiles.push(...files.image);
      if (files?.images) uploadedFiles.push(...files.images);

      if (uploadedFiles.length > 0) {
        const urls = uploadedFiles.map((file) => `/uploads/documents/${file.filename}`);
        data.imageUrls = urls;
        data.imageUrl = urls[0];
      }

      const removeCurrentImages = req.body.removeCurrentImages === 'true' || req.body.removeCurrentImages === true;
      if (removeCurrentImages && uploadedFiles.length === 0) {
        data.imageUrl = '';
        data.imageUrls = [];
      }

      const hasImageChange = Object.prototype.hasOwnProperty.call(data, 'imageUrl') || Object.prototype.hasOwnProperty.call(data, 'imageUrls');
      const hasChange = !!(
        data.title ||
        data.description ||
        data.shortDescription ||
        data.basePrice ||
        data.category ||
        data.priceUnit ||
        data.professionalId ||
        hasImageChange
      );
      if (!hasChange) {
        return ApiResponseHelper.error(res, 'No updatable fields provided', 400);
      }

      const service = await serviceService.updateService(req.params.id as string, data, hasImageChange);
      return ApiResponseHelper.success(res, service, "Service updated successfully");
    } catch (error: any) {
      logger.error(error);
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async deleteService(req: Request, res: Response) {
    try {
      await serviceService.deleteService(req.params.id as string);
      return ApiResponseHelper.success(res, null, "Service deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async deleteServiceImage(req: Request, res: Response) {
    try {
      const svc = await serviceService.getServiceById(req.params.id as string);
      // allow admin or owner
      const user = (req as any).user;
      if (!user) return ApiResponseHelper.error(res, 'Unauthorized', 401);
      const isAdmin = user.role === 'admin';
      const isOwner = svc.professionalId?.toString() === user.id;
      if (!isAdmin && !isOwner) return ApiResponseHelper.error(res, 'Forbidden', 403);
      await serviceService.deleteServiceImage(req.params.id as string, (req as any).user?.id);
      return ApiResponseHelper.success(res, null, 'Service image deleted');
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }
}
