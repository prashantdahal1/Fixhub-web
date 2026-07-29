import { Router } from "express";
import { ReviewController } from "./review.controller.js";
import { authorizedMiddleware } from "../../shared/middlewares/authorized.middleware.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { CreateReviewDTO } from "../../dtos/marketplace.dto.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const router = Router();
const controller = new ReviewController();

router.get("/service/:serviceId", asyncHandler(controller.listForService));
router.post(
  "/",
  authorizedMiddleware,
  validateBody(CreateReviewDTO),
  asyncHandler(controller.create)
);

export default router;
