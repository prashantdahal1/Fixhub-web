import mongoose from "mongoose";
import { MONGODB_URL } from '../config/constants.js';

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URL, {
            dbName: "fixhub"
        });
        const conn = mongoose.connection;
        console.log("Connected to MongoDB successfully");
        console.log(`Host: ${conn.host}`);
        console.log(`Port: ${conn.port}`);
        console.log(`Database Name: ${conn.name}`);
        console.log(`Collections: ${Object.keys(conn.collections).join(", ")}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}