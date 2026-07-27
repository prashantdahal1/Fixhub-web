import { Router } from "express";
import { createTicket, getAllTickets, updateTicketStatus, updateTicket, deleteTicket, bulkDeleteTickets } from "./ticket.controller.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { CreateTicketDTO, UpdateTicketStatusDTO, UpdateTicketDTO, BulkDeleteTicketsDTO } from "../../dtos/marketplace.dto.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { authorizedMiddleware, adminMiddleware } from "../../shared/middlewares/authorized.middleware.js";

const router = Router();

router.post("/", validateBody(CreateTicketDTO), asyncHandler(createTicket));
router.get("/admin", authorizedMiddleware, adminMiddleware, asyncHandler(getAllTickets));
router.patch("/admin/:id/status", authorizedMiddleware, adminMiddleware, validateBody(UpdateTicketStatusDTO), asyncHandler(updateTicketStatus));
router.patch("/admin/:id", authorizedMiddleware, adminMiddleware, validateBody(UpdateTicketDTO), asyncHandler(updateTicket));
router.delete("/:id", authorizedMiddleware, adminMiddleware, asyncHandler(deleteTicket));
router.post("/admin/bulk-delete", authorizedMiddleware, adminMiddleware, validateBody(BulkDeleteTicketsDTO), asyncHandler(bulkDeleteTickets));

export default router;
