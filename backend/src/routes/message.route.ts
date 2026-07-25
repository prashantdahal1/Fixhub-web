import { Router } from "express";
import { MessageController } from "../controllers/message.controller.js";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const controller = new MessageController();

router.use(authorizedMiddleware);
router.get("/booking/:bookingId", asyncHandler(controller.getMessagesByBooking));

export default router;
