import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fixhub';

export const PROS_TO_SEED = [
  {
    firstName: "Rambehadur",
    lastName: "Tamang",
    email: "rambehadur.tamang@fixhub.com",
    username: "rambehadur_pro",
    phoneNumber: "9841000001",
    profilePicture: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.9,
    reviewCount: 124,
    city: "Kathmandu",
    address: "Baneshwor, Kathmandu"
  },
  {
    firstName: "Harendra",
    lastName: "Prasad",
    email: "harendra.prasad@fixhub.com",
    username: "harendra_pro",
    phoneNumber: "9841000002",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.8,
    reviewCount: 89,
    city: "Kathmandu",
    address: "Koteshwor, Kathmandu"
  },
  {
    firstName: "Nischal",
    lastName: "Basnet",
    email: "nischal.basnet@fixhub.com",
    username: "nischal_pro",
    phoneNumber: "9841000003",
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.9,
    reviewCount: 210,
    city: "Lalitpur",
    address: "Patan, Lalitpur"
  },
  {
    firstName: "Bikram",
    lastName: "Thapa",
    email: "bikram.thapa@fixhub.com",
    username: "bikram_pro",
    phoneNumber: "9841000004",
    profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.7,
    reviewCount: 67,
    city: "Kathmandu",
    address: "Chabahil, Kathmandu"
  },
  {
    firstName: "Sabin",
    lastName: "Shrestha",
    email: "sabin.shrestha@fixhub.com",
    username: "sabin_pro",
    phoneNumber: "9841000005",
    profilePicture: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.8,
    reviewCount: 43,
    city: "Bhaktapur",
    address: "Suryabinayak, Bhaktapur"
  },
  {
    firstName: "Rita",
    lastName: "Devi",
    email: "rita.devi@fixhub.com",
    username: "rita_pro",
    phoneNumber: "9841000006",
    profilePicture: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.9,
    reviewCount: 156,
    city: "Kathmandu",
    address: "Lazimpat, Kathmandu"
  },
  {
    firstName: "Ramesh",
    lastName: "Adhikari",
    email: "ramesh.adhikari@fixhub.com",
    username: "ramesh_pro",
    phoneNumber: "9841000007",
    profilePicture: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.8,
    reviewCount: 94,
    city: "Lalitpur",
    address: "Jawalakhel, Lalitpur"
  },
  {
    firstName: "Santosh",
    lastName: "Giri",
    email: "santosh.giri@fixhub.com",
    username: "santosh_pro",
    phoneNumber: "9841000008",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.7,
    reviewCount: 82,
    city: "Kathmandu",
    address: "Kalanki, Kathmandu"
  },
  {
    firstName: "Rohan",
    lastName: "Gurung",
    email: "rohan.gurung@fixhub.com",
    username: "rohan_pro",
    phoneNumber: "9841000009",
    profilePicture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.9,
    reviewCount: 112,
    city: "Kathmandu",
    address: "Balaju, Kathmandu"
  },
  {
    firstName: "Prem",
    lastName: "Bahadur",
    email: "prem.bahadur@fixhub.com",
    username: "prem_pro",
    phoneNumber: "9841000010",
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    averageRating: 4.8,
    reviewCount: 75,
    city: "Kathmandu",
    address: "Maharajgunj, Kathmandu"
  }
];

async function seedUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const existingAdmin = await UserModel.findOne({ email: 'admin@fixhub.com' });
        if (!existingAdmin) {
            const adminUser = new UserModel({
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin@fixhub.com',
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                phoneNumber: '1234567890',
                status: 'active',
                isVerified: true
            });
            await adminUser.save();
            console.log('Admin user seeded (admin@fixhub.com / admin123)');
        }

        for (const proData of PROS_TO_SEED) {
            const existingPro = await UserModel.findOne({ email: proData.email });
            if (!existingPro) {
                await UserModel.create({
                    ...proData,
                    password: hashedPassword,
                    role: 'professional',
                    status: 'active',
                    isVerified: true
                });
                console.log(`Seeded professional: ${proData.firstName} ${proData.lastName} (${proData.email})`);
            } else {
                await UserModel.updateOne(
                    { email: proData.email },
                    {
                        $set: {
                            firstName: proData.firstName,
                            lastName: proData.lastName,
                            profilePicture: proData.profilePicture,
                            averageRating: proData.averageRating,
                            reviewCount: proData.reviewCount,
                            status: 'active',
                            isVerified: true
                        }
                    }
                );
                console.log(`Updated professional: ${proData.firstName} ${proData.lastName}`);
            }
        }

        console.log('All professionals and admin user seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
}

seedUsers();
