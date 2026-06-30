import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fixhub';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await UserModel.findOne({ email: 'admin@fixhub.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = new UserModel({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@fixhub.com',
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            phoneNumber: '1234567890'
        });

        await adminUser.save();
        console.log('Admin user seeded successfully!');
        console.log('Email: admin@fixhub.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
}

seedAdmin();
