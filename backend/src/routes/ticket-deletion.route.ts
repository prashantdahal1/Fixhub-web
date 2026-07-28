import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authorizedMiddleware, adminMiddleware } from '../middlewares/authorized.middleware.js';
import { TicketDeletionModel } from '../models/ticket-deletion.model.js';

const router = Router();

router.get('/admin', authorizedMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const logs = await TicketDeletionModel.find().sort({ createdAt: -1 }).limit(200);
  return res.json({ success: true, data: logs });
}));

export default router;
