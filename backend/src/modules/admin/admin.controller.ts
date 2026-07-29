import type { Request, Response } from 'express';
import { ApiResponseHelper } from '../../shared/utils/apihelper.util.js';
import { ServiceModel } from '../../models/service.model.js';
import { createNotification } from '../../shared/utils/notification.util.js';
import { broadcastRealtimeEvent } from '../../shared/utils/realtime.util.js';
import type { ApproveServiceDTO } from '../../dtos/marketplace.dto.js';

// Very small heuristic-based image suggestion endpoint.
// This is a placeholder for a real AI/vision integration (Google Vision, AWS Rekognition, etc.).
export class AdminController {
  suggestServiceFromImage = async (req: Request, res: Response) => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      const filename = file?.originalname?.toLowerCase() || '';

      const keywordMap: Record<string, { category: string; title: string; shortDescription: string; basePrice?: number; priceUnit?: string }> = {
        carpenter: { category: 'carpenter', title: 'Carpentry & Furniture Repair', shortDescription: 'Door fixing, cabinet repair, custom shelf installation.', basePrice: 700, priceUnit: 'flat' },
        wood: { category: 'carpenter', title: 'Woodwork & Carpentry', shortDescription: 'Custom woodwork and repairs for furniture and fixtures.', basePrice: 800, priceUnit: 'flat' },
        paint: { category: 'painter', title: 'Interior Painting', shortDescription: 'Professional interior painting with premium finish.', basePrice: 18, priceUnit: 'per_sqft' },
        electrician: { category: 'electrician', title: 'Electrical Wiring & Repair', shortDescription: 'Full home wiring, circuit fixes, socket installation and load management.', basePrice: 800, priceUnit: 'flat' },
        ac: { category: 'ac_repair', title: 'AC Service & Deep Clean', shortDescription: 'Full AC tune-up including filter wash, coil cleaning, gas refill check.', basePrice: 1200, priceUnit: 'flat' },
        plumber: { category: 'plumber', title: 'Plumbing Leak Fix', shortDescription: 'Pipe leak detection and repair, tap replacement, drain cleaning.', basePrice: 600, priceUnit: 'flat' },
        clean: { category: 'cleaner', title: 'Home Deep Cleaning', shortDescription: 'Comprehensive home cleaning services.', basePrice: 500, priceUnit: 'flat' },
        pest: { category: 'pest_control', title: 'Pest Control Service', shortDescription: 'Effective pest control for home and office.', basePrice: 1200, priceUnit: 'flat' },
      };

      // find first matching keyword
      for (const key of Object.keys(keywordMap)) {
        if (filename.includes(key)) {
          return ApiResponseHelper.success(res, { suggested: keywordMap[key] }, 'Suggestion generated');
        }
      }

      // Fallback: try to infer from mimetype or return generic
      if (file && file.mimetype?.startsWith('image/')) {
        return ApiResponseHelper.success(res, { suggested: { category: 'other', title: 'Visual Service', shortDescription: 'Service detected from image. Please refine.', basePrice: 500, priceUnit: 'flat' } }, 'Suggestion generated');
      }

      return ApiResponseHelper.error(res, 'No suggestion available', 400);
    } catch (err: any) {
      return ApiResponseHelper.error(res, err?.message || 'Suggestion failed', 500);
    }
  };

  getPendingServices = async (req: Request, res: Response) => {
    try {
      // Return all services so admin can see pending/approved/rejected in one view.
      // Optional ?status= filter for future use.
      const statusFilter = req.query.status as string | undefined;
      const query: Record<string, any> = {};
      if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
        query.approvalStatus = statusFilter;
      }
      const services = await ServiceModel.find(query)
        .populate('professionalId', 'firstName lastName email phoneNumber')
        .sort({ createdAt: -1 });

      return ApiResponseHelper.success(res, services, 'Services fetched successfully');
    } catch (err: any) {
      return ApiResponseHelper.error(res, err?.message || 'Failed to fetch services', 500);
    }
  };

  approveService = async (req: Request, res: Response) => {
    try {
      const { serviceId, action, rejectionReason } = req.body as ApproveServiceDTO;

      const service = await ServiceModel.findById(serviceId);
      if (!service) {
        return ApiResponseHelper.error(res, 'Service not found', 404);
      }

      if (service.approvalStatus !== 'pending') {
        return ApiResponseHelper.error(res, 'Service has already been processed', 400);
      }

      if (action === 'approve') {
        service.approvalStatus = 'approved';
        service.isActive = true;
        await service.save();

        // Notify professional about approval
        await createNotification(
          service.professionalId,
          'Service Approved',
          `Your service "${service.title}" has been approved and is now active.`,
          'service'
        );

        broadcastRealtimeEvent('service_approved', {
          serviceId: service._id.toString(),
          serviceTitle: service.title,
          professionalId: service.professionalId.toString(),
        });

        return ApiResponseHelper.success(res, service, 'Service approved successfully');
      } else if (action === 'reject') {
        service.approvalStatus = 'rejected';
        service.rejectionReason = rejectionReason || 'Service did not meet approval criteria';
        service.isActive = false;
        await service.save();

        // Notify professional about rejection
        await createNotification(
          service.professionalId,
          'Service Rejected',
          `Your service "${service.title}" was rejected. Reason: ${service.rejectionReason}`,
          'service'
        );

        broadcastRealtimeEvent('service_rejected', {
          serviceId: service._id.toString(),
          serviceTitle: service.title,
          professionalId: service.professionalId.toString(),
          rejectionReason: service.rejectionReason,
        });

        return ApiResponseHelper.success(res, service, 'Service rejected successfully');
      } else {
        return ApiResponseHelper.error(res, 'Invalid action', 400);
      }
    } catch (err: any) {
      return ApiResponseHelper.error(res, err?.message || 'Failed to process service approval', 500);
    }
  };
}

export default new AdminController();
