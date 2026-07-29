import { Router } from "express";
import { MessageController } from "./message.controller.js";
import { authorizedMiddleware } from "../../shared/middlewares/authorized.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const router = Router();
const controller = new MessageController();

router.use(authorizedMiddleware);
router.get("/booking/:bookingId", asyncHandler(controller.getMessagesByBooking));

export default router;
