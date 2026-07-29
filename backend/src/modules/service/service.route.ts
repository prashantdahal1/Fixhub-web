import { Router } from "express";
import { ServiceController } from "./service.controller.js";
import { authorizedMiddleware } from "../../shared/middlewares/authorized.middleware.js";
import { requireVerifiedPro } from "../../shared/middlewares/proVerification.middleware.js";
import { documentUpload } from "../../shared/middlewares/documentUpload.middleware.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { CreateServiceDTO } from "../../dtos/marketplace.dto.js";

const router = Router();
const controller = new ServiceController();

import { optionalAuthMiddleware } from "../../shared/middlewares/optionalAuth.middleware.js";

router.get("/", optionalAuthMiddleware, (req, res) => controller.getServices(req, res));
router.get("/slug/:slug", (req, res) => controller.getServiceBySlug(req, res));
router.get("/professional/:professionalId", (req, res) => controller.getServicesByProfessional(req, res));
router.get("/:id", (req, res) => controller.getServiceById(req, res));

// Only verified professionals can create, update or delete services
router.post(
    "/",
    authorizedMiddleware,
    requireVerifiedPro,
    documentUpload.fields([
      { name: "image", maxCount: 1 },
      { name: "images", maxCount: 4 },
    ]),
    validateBody(CreateServiceDTO.partial()), // Allow partial - AI fills missing fields
    (req, res) => controller.createService(req, res)
);

// AI service description generation endpoint
router.post(
    "/generate-ai-description",
    authorizedMiddleware,
    requireVerifiedPro,
    documentUpload.fields([
      { name: "image", maxCount: 1 },
      { name: "images", maxCount: 4 },
    ]),
    (req, res) => controller.generateAIServiceDescription(req, res)
);

router.put(
    "/:id",
    authorizedMiddleware,
    requireVerifiedPro,
    documentUpload.fields([
      { name: "image", maxCount: 1 },
      { name: "images", maxCount: 4 },
    ]),
    (req, res) => controller.updateService(req, res)
);

router.delete(
    "/:id",
    authorizedMiddleware,
        requireVerifiedPro,
        (req, res) => controller.deleteService(req, res)
);

router.delete(
    "/:id/image",
    authorizedMiddleware,
    (req, res) => controller.deleteServiceImage(req, res)
);

export default router;
