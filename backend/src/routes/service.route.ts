import { Router } from "express";
import { ServiceController } from "../controllers/service.controller.js";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.js";
import { requireVerifiedPro } from "../middlewares/proVerification.middleware.js";
import { documentUpload } from "../middlewares/documentUpload.middleware.js";

const router = Router();
const controller = new ServiceController();

router.get("/", (req, res) => controller.getServices(req, res));
router.get("/slug/:slug", (req, res) => controller.getServiceBySlug(req, res));
router.get("/:id", (req, res) => controller.getServiceById(req, res));

// Only verified professionals can create, update or delete services
router.post(
    "/",
    authorizedMiddleware,
    requireVerifiedPro,
    documentUpload.single("image"),
    (req, res) => controller.createService(req, res)
);

router.put(
    "/:id",
    authorizedMiddleware,
    requireVerifiedPro,
    documentUpload.single("image"),
    (req, res) => controller.updateService(req, res)
);

router.delete(
    "/:id",
    authorizedMiddleware,
    requireVerifiedPro,
    (req, res) => controller.deleteService(req, res)
);

export default router;
