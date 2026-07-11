import { Router } from "express";
import { createTicket, getAllTickets, updateTicketStatus } from "../controllers/ticket.controller.js";

const router = Router();

// Public/Customer routes
router.post("/", createTicket);

// Admin routes (assuming simple routes for now, typically protected by an admin middleware)
router.get("/admin", getAllTickets);
router.patch("/admin/:id/status", updateTicketStatus);

export default router;
