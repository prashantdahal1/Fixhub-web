import { Router } from "express";
import { NotificationController } from "./notification.controller.js";
import { authorizedMiddleware } from "../../shared/middlewares/authorized.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const router = Router();
const controller = new NotificationController();

router.use(authorizedMiddleware);

router.get("/", asyncHandler(controller.getAll));
router.get("/stream", asyncHandler(controller.stream));
router.patch("/read-all", asyncHandler(controller.markAllRead));
router.patch("/:id/read", asyncHandler(controller.markRead));
router.delete("/clear-all", asyncHandler(controller.deleteAll));
router.delete("/:id", asyncHandler(controller.deleteOne));

export default router;
