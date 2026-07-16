import { Router } from "express";
import { createTicket, getAllTickets, updateTicketStatus } from "../controllers/ticket.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { CreateTicketDTO, UpdateTicketStatusDTO } from "../dtos/marketplace.dto.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", validateBody(CreateTicketDTO), asyncHandler(createTicket));
router.get("/admin", asyncHandler(getAllTickets));
router.patch("/admin/:id/status", validateBody(UpdateTicketStatusDTO), asyncHandler(updateTicketStatus));

export default router;
