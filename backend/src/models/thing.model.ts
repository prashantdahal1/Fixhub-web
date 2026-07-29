import mongoose, { Schema, Document } from "mongoose";

export interface IThing extends Document {
    name: string;
    description?: string;
    createdBy?: mongoose.Types.ObjectId;
}

const ThingSchema: Schema = new Schema<IThing>(
    {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export const ThingModel = mongoose.model<IThing>("Thing", ThingSchema);
