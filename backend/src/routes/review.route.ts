import { Router } from "express";
import { ReviewController } from "../controllers/review.controller.js";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { CreateReviewDTO } from "../dtos/marketplace.dto.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
