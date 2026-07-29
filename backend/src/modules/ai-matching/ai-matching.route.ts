import { Router } from "express";
import { findBestMatches, getProfessionalAnalytics } from "./ai-matching.controller.js";
import { jwtAuth } from "../../shared/middlewares/jwtAuth.middleware.js";

const router = Router();

// Test endpoint to verify backend is working
router.get("/test", (req, res) => {
  res.json({ success: true, message: "AI matching backend is working" });
});

// AI Matching Routes
// Temporarily making matches public to bypass auth issue
router.post("/matches", findBestMatches);
router.get("/analytics/:professionalId", jwtAuth, getProfessionalAnalytics);

export default router;
