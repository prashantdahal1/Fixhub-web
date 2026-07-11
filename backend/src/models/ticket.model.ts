import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
    ticketId: string;
    bookingId: string;
    technicianName: string;
    category: string;
    description: string;
    status: "Under Review" | "In Progress" | "Resolved";
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema = new Schema<ITicket>(
    {
        ticketId: { type: String, required: true, unique: true },
        bookingId: { type: String, required: true },
        technicianName: { type: String, default: 'Unassigned' },
        category: { type: String, required: true },
        description: { type: String, required: true },
        status: { 
            type: String, 
            enum: ["Under Review", "In Progress", "Resolved"], 
            default: "Under Review" 
        },
    },
    {
        timestamps: true
    }
);

export const TicketModel = mongoose.model<ITicket>("Ticket", TicketSchema);
