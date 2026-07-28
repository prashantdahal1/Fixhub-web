import { Router } from 'express';
import { jwtAuth } from '../../shared/middlewares/jwtAuth.middleware.js';
import { ApiResponseHelper } from '../../shared/utils/apihelper.util.js';
import { ThingService } from './thing.service.js';
import type { Request, Response } from 'express';

const router = Router();
const thingService = new ThingService();

// POST / - create a Thing (protected)
router.post('/', jwtAuth, async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        if (!name || typeof name !== 'string') {
            return ApiResponseHelper.error(res, 'Name is required', 400);
        }
        const user = (req as any).user;
        const created = await thingService.createThing({ name: name.trim(), description: description || '' }, user?._id?.toString?.());
        return ApiResponseHelper.success(res, created, 'Thing created', 201);
    } catch (error: any) {
        console.error('Thing create error:', error);
        return ApiResponseHelper.error(res, error?.message || 'Failed to create Thing', 500);
    }
});

export default router;
