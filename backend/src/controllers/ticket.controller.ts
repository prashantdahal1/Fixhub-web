import type { Request, Response, NextFunction } from "express";
import { TicketModel } from "../models/ticket.model.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId, technicianName, category, description } = req.body;
        
        // Generate a random ticket ID like TKT-12345
        const randomId = "TKT-" + Math.floor(10000 + Math.random() * 90000);

        const newTicket = new TicketModel({
            ticketId: randomId,
            bookingId,
            technicianName,
            category,
            description,
        });

        const savedTicket = await newTicket.save();
        
        return ApiResponseHelper.success(res, "Ticket created successfully", savedTicket, 201);
    } catch (error) {
        next(error);
    }
};

export const getAllTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tickets = await TicketModel.find().sort({ createdAt: -1 });
        return ApiResponseHelper.success(res, "Tickets retrieved successfully", tickets);
    } catch (error) {
        next(error);
    }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedTicket = await TicketModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedTicket) {
            return ApiResponseHelper.error(res, "Ticket not found", 404);
        }

        return ApiResponseHelper.success(res, "Ticket status updated", updatedTicket);
    } catch (error) {
        next(error);
    }
};
