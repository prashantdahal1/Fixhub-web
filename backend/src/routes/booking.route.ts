import { Router } from "express";
import { BookingController } from "../controllers/booking.controller.js";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { CreateBookingDTO, UpdateBookingStatusDTO } from "../dtos/marketplace.dto.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const controller = new BookingController();

// Public callback verification endpoints
router.get("/verify/esewa", asyncHandler(controller.verifyEsewa));
router.get("/verify/khalti", asyncHandler(controller.verifyKhalti));
router.get("/cancel/esewa", asyncHandler(controller.cancelEsewa));

router.use(authorizedMiddleware);

router.post("/", validateBody(CreateBookingDTO), asyncHandler(controller.create));
router.get("/", asyncHandler(controller.listMine));
router.get("/:id", asyncHandler(controller.getOne));
router.patch(
  "/:id/status",
  validateBody(UpdateBookingStatusDTO),
  asyncHandler(controller.updateStatus)
);

export default router;
