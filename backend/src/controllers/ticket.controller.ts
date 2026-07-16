import type { Request, Response, NextFunction } from "express";
import { TicketModel } from "../models/ticket.model.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import type { CreateTicketDTO, UpdateTicketStatusDTO } from "../dtos/marketplace.dto.js";

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId, technicianName, category, description } = req.body as CreateTicketDTO;
        const randomId = "TKT-" + Math.floor(10000 + Math.random() * 90000);

        const savedTicket = await TicketModel.create({
            ticketId: randomId,
            bookingId,
            technicianName: technicianName || "Unassigned",
            category,
            description,
        });

        return ApiResponseHelper.success(res, savedTicket, "Ticket created successfully", 201);
    } catch (error) {
        next(error);
    }
};

export const getAllTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tickets = await TicketModel.find().sort({ createdAt: -1 });
        return ApiResponseHelper.success(res, tickets, "Tickets retrieved successfully");
    } catch (error) {
        next(error);
    }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body as UpdateTicketStatusDTO;

        const updatedTicket = await TicketModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedTicket) {
            return ApiResponseHelper.error(res, "Ticket not found", 404);
        }

        return ApiResponseHelper.success(res, updatedTicket, "Ticket status updated");
    } catch (error) {
        next(error);
    }
};
