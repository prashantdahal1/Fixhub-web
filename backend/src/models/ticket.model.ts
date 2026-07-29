import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
    ticketId: string;
    userId?: mongoose.Types.ObjectId;
    bookingId?: string;
    subject?: string;
    technicianName: string;
    category: string;
    description: string;
    adminReply?: string;
    repliedAt?: Date;
    status: "Under Review" | "In Progress" | "Resolved";
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema = new Schema<ITicket>(
    {
        ticketId: { type: String, required: true, unique: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        bookingId: { type: String, required: false },
        subject: { type: String, required: false },
        technicianName: { type: String, default: 'Unassigned' },
        category: { type: String, required: true },
        description: { type: String, required: true },
        adminReply: { type: String, required: false },
        repliedAt: { type: Date, required: false },
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

TicketSchema.index({ bookingId: 1 });
TicketSchema.index({ status: 1 });

export const TicketModel = mongoose.model<ITicket>("Ticket", TicketSchema);
