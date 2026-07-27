import type { Request, Response, NextFunction } from "express";
import { TicketModel } from "../../models/ticket.model.js";
import { TicketDeletionModel } from "../../models/ticket-deletion.model.js";
import { ApiResponseHelper } from "../../shared/utils/apihelper.util.js";
import { createAdminNotification } from "../../shared/utils/notification.util.js";
import type { CreateTicketDTO, UpdateTicketStatusDTO, UpdateTicketDTO } from "../../dtos/marketplace.dto.js";

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId, subject, technicianName, category, description } = req.body as CreateTicketDTO;
        const randomId = "TKT-" + Math.floor(10000 + Math.random() * 90000);

        const savedTicket = await TicketModel.create({
            ticketId: randomId,
            technicianName: technicianName || "Support",
            category,
            description,
            ...(bookingId ? { bookingId } : {}),
            ...(subject?.trim() ? { subject: subject.trim() } : {}),
        });

        await createAdminNotification(
          "New support ticket raised",
          `Ticket ${randomId} was created for booking ${bookingId || "N/A"}. Subject: ${subject?.trim() || "No subject"}`,
          "confirm"
        );

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

export const updateTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, category, technicianName, description } = req.body as UpdateTicketDTO;

        const updateFields: any = {};
        if (status) updateFields.status = status;
        if (category) updateFields.category = category;
        if (technicianName !== undefined) updateFields.technicianName = technicianName;
        if (description) updateFields.description = description;

        const updatedTicket = await TicketModel.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );

        if (!updatedTicket) {
            return ApiResponseHelper.error(res, "Ticket not found", 404);
        }

        return ApiResponseHelper.success(res, updatedTicket, "Ticket updated successfully");
    } catch (error) {
        next(error);
    }
};

export const deleteTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deleted = await TicketModel.findByIdAndDelete(id);
        if (!deleted) return ApiResponseHelper.error(res, "Ticket not found", 404);

        // Record deletion audit
        try {
            await TicketDeletionModel.create({ ticketId: deleted.ticketId, deletedBy: (req as any).user?.id });
        } catch (auditErr) {
            console.warn('Failed to write ticket deletion audit', auditErr);
        }

        return ApiResponseHelper.success(res, deleted, "Ticket deleted");
    } catch (error) {
        next(error);
    }
};

export const bulkDeleteTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body as { ids: string[] };
        const tickets = await TicketModel.find({ _id: { $in: ids } });
        const result = await TicketModel.deleteMany({ _id: { $in: ids } });

        // Record audit entries
        try {
            const audits = tickets.map(t => ({ ticketId: t.ticketId, deletedBy: (req as any).user?.id }));
            if (audits.length) await TicketDeletionModel.insertMany(audits);
        } catch (auditErr) {
            console.warn('Failed to write ticket bulk deletion audits', auditErr);
        }

        return ApiResponseHelper.success(res, { deletedCount: result.deletedCount }, "Bulk delete completed");
    } catch (error) {
        next(error);
    }
};
