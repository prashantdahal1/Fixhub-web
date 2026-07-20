import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller.js";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { TopUpWalletDTO } from "../dtos/marketplace.dto.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const controller = new WalletController();

// Public callback verification endpoints (redirected from gateways)
router.get("/verify/esewa", asyncHandler(controller.verifyEsewa));
router.get("/verify/khalti", asyncHandler(controller.verifyKhalti));

// Protected routes
router.use(authorizedMiddleware);

router.get("/", asyncHandler(controller.getMine));
router.post("/topup", validateBody(TopUpWalletDTO), asyncHandler(controller.topUp));
router.post("/initiate-payment", asyncHandler(controller.initiatePayment));

export default router;
