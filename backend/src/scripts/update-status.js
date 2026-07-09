import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fixhub';

async function updateStatus() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await UserModel.updateMany(
            { $or: [{ status: { $exists: false } }, { status: null }] },
            { $set: { status: 'active' } }
        );

        console.log(`Successfully updated ${result.modifiedCount} users to active status.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
}

updateStatus();
