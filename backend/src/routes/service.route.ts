import { Router } from "express";
import { ServiceController } from "../controllers/service.controller.js";

const router = Router();
const controller = new ServiceController();

router.get("/", (req, res) => controller.getServices(req, res));
router.get("/slug/:slug", (req, res) => controller.getServiceBySlug(req, res));
router.get("/:id", (req, res) => controller.getServiceById(req, res));
router.post("/", (req, res) => controller.createService(req, res));
router.put("/:id", (req, res) => controller.updateService(req, res));
router.delete("/:id", (req, res) => controller.deleteService(req, res));

export default router;
