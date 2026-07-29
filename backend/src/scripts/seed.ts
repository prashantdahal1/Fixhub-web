import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model.js';
import { ServiceModel } from '../models/service.model.js';
import { BookingModel } from '../models/booking.model.js';
import { ChatMessageModel } from '../models/chat-message.model.js';
import { TicketModel } from '../models/ticket.model.js';

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
  }
];

async function seedUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✓ Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Seed Admin User
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
            console.log('✓ Admin user seeded (admin@fixhub.com / admin123)');
        }

        // Seed Professional Users
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
                console.log(`✓ Seeded professional: ${proData.firstName} ${proData.lastName}`);
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
                console.log(`✓ Updated professional: ${proData.firstName} ${proData.lastName}`);
            }
        }

        console.log('\n📚 All professionals and admin user seeded successfully!\n');
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
}

async function seedServices(proIds: string[]) {
    try {
        console.log('📦 Seeding Services...');
        
        const services = [
            {
                professionalId: new mongoose.Types.ObjectId(proIds[0]),
                title: "Electrical Wiring & Installation",
                slug: "electrical-wiring-installation",
                category: "electrician" as const,
                description: "Professional electrical wiring, installation, and repairs for homes and offices. Expert handling of circuits, outlets, switches and safety compliance.",
                shortDescription: "Complete electrical wiring and installation services",
                basePrice: 1500,
                priceUnit: "flat" as const,
                tags: ["electrical", "wiring", "installation", "safe"],
                specifications: [
                    { label: "Experience", value: "15+ years" },
                    { label: "Certification", value: "Licensed Electrician" }
                ],
                isActive: true,
                isCertified: true,
                estimatedDuration: "2-4 hours"
            },
            {
                professionalId: new mongoose.Types.ObjectId(proIds[1]),
                title: "Plumbing Repair & Maintenance",
                slug: "plumbing-repair-maintenance",
                category: "plumber" as const,
                description: "Expert plumbing services including leak detection, pipe repair, drain cleaning, and fixture installation.",
                shortDescription: "Comprehensive plumbing repair and maintenance",
                basePrice: 1000,
                priceUnit: "flat" as const,
                tags: ["plumbing", "repair", "pipes", "maintenance"],
                specifications: [
                    { label: "Experience", value: "12+ years" },
                    { label: "Tools", value: "Modern equipment" }
                ],
                isActive: true,
                isCertified: true,
                estimatedDuration: "1-3 hours"
            },
            {
                professionalId: new mongoose.Types.ObjectId(proIds[2]),
                title: "AC Service & Deep Cleaning",
                slug: "ac-service-deep-cleaning",
                category: "ac_repair" as const,
                description: "Professional AC maintenance, repair, gas refilling, and deep cleaning to ensure optimal cooling and air quality.",
                shortDescription: "Complete AC servicing and maintenance",
                basePrice: 1200,
                priceUnit: "flat" as const,
                tags: ["AC", "cooling", "maintenance", "repair"],
                specifications: [
                    { label: "Experience", value: "18+ years" },
                    { label: "Warranty", value: "6 months on service" }
                ],
                isActive: true,
                isCertified: true,
                estimatedDuration: "2-3 hours"
            },
            {
                professionalId: new mongoose.Types.ObjectId(proIds[3]),
                title: "Professional Painting Services",
                slug: "professional-painting",
                category: "painter" as const,
                description: "Interior and exterior painting with high-quality materials, color consultation, and perfect finishing.",
                shortDescription: "Interior & exterior professional painting",
                basePrice: 2500,
                priceUnit: "per_sqft" as const,
                tags: ["painting", "interior", "exterior", "decorative"],
                specifications: [
                    { label: "Experience", value: "10+ years" },
                    { label: "Materials", value: "Premium quality paints" }
                ],
                isActive: true,
                isCertified: true,
                estimatedDuration: "3-5 days"
            },
            {
                professionalId: new mongoose.Types.ObjectId(proIds[4]),
                title: "Carpentry & Woodwork",
                slug: "carpentry-woodwork",
                category: "carpenter" as const,
                description: "Custom carpentry, furniture making, repairs, and woodwork with precision and quality craftsmanship.",
                shortDescription: "Expert carpentry and woodwork services",
                basePrice: 3000,
                priceUnit: "flat" as const,
                tags: ["carpentry", "furniture", "woodwork", "custom"],
                specifications: [
                    { label: "Experience", value: "20+ years" },
                    { label: "Specialty", value: "Custom furniture" }
                ],
                isActive: true,
                isCertified: true,
                estimatedDuration: "5-7 days"
            }
        ];

        for (const serviceData of services) {
            const existing = await ServiceModel.findOne({ slug: serviceData.slug });
            if (!existing) {
                await ServiceModel.create(serviceData);
                console.log(`  ✓ Created service: ${serviceData.title}`);
            }
        }
    } catch (error) {
        console.error('Error seeding services:', error);
        throw error;
    }
}

async function seedBookings(userIds: string[], serviceIds: string[]) {
    try {
        console.log('\n📅 Seeding Bookings...');

        const bookings = [
            {
                customerId: new mongoose.Types.ObjectId(userIds[0]),
                professionalId: new mongoose.Types.ObjectId(userIds[5]),
                serviceId: new mongoose.Types.ObjectId(serviceIds[0]),
                scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                address: "Thamel, Kathmandu",
                notes: "Please bring all necessary tools",
                amount: 1500,
                status: "confirmed" as const,
                escrowStatus: "held" as const
            },
            {
                customerId: new mongoose.Types.ObjectId(userIds[1]),
                professionalId: new mongoose.Types.ObjectId(userIds[6]),
                serviceId: new mongoose.Types.ObjectId(serviceIds[1]),
                scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                address: "Patan, Lalitpur",
                notes: "Fix leaking kitchen faucet",
                amount: 1000,
                status: "confirmed" as const,
                escrowStatus: "held" as const
            },
            {
                customerId: new mongoose.Types.ObjectId(userIds[2]),
                professionalId: new mongoose.Types.ObjectId(userIds[7]),
                serviceId: new mongoose.Types.ObjectId(serviceIds[2]),
                scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                address: "Lazimpat, Kathmandu",
                notes: "AC is not cooling properly",
                amount: 1200,
                status: "in_progress" as const,
                escrowStatus: "held" as const
            },
            {
                customerId: new mongoose.Types.ObjectId(userIds[3]),
                professionalId: new mongoose.Types.ObjectId(userIds[8]),
                serviceId: new mongoose.Types.ObjectId(serviceIds[3]),
                scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                address: "Bhaktapur",
                notes: "Paint entire house",
                amount: 5000,
                status: "confirmed" as const,
                escrowStatus: "none" as const
            }
        ];

        for (const bookingData of bookings) {
            const existing = await BookingModel.findOne({
                customerId: bookingData.customerId,
                serviceId: bookingData.serviceId
            });
            if (!existing) {
                await BookingModel.create(bookingData);
                console.log(`  ✓ Created booking for ${bookingData.address}`);
            }
        }
    } catch (error) {
        console.error('Error seeding bookings:', error);
        throw error;
    }
}

async function seedMessages(bookingIds: string[], userIds: string[]) {
    try {
        console.log('\n💬 Seeding Chat Messages...');

        const messages = [
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[0]),
                senderId: new mongoose.Types.ObjectId(userIds[0]),
                senderName: "Customer",
                text: "When can you come for the wiring work?"
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[0]),
                senderId: new mongoose.Types.ObjectId(userIds[5]),
                senderName: "Rambehadur Tamang",
                text: "I can come on Saturday morning. Is that suitable for you?"
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[0]),
                senderId: new mongoose.Types.ObjectId(userIds[0]),
                senderName: "Customer",
                text: "Yes, Saturday morning works. Please arrive by 9 AM. Also bring extra wire for the switchboard."
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[1]),
                senderId: new mongoose.Types.ObjectId(userIds[1]),
                senderName: "Customer",
                text: "The faucet started leaking again. Can you replace it this afternoon?"
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[1]),
                senderId: new mongoose.Types.ObjectId(userIds[6]),
                senderName: "Harendra Prasad",
                text: "Yes, I have the spare part. I'll also check the sink drainage while I'm there."
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[1]),
                senderId: new mongoose.Types.ObjectId(userIds[1]),
                senderName: "Customer",
                text: "Great, please knock on the back door when you arrive."
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[2]),
                senderId: new mongoose.Types.ObjectId(userIds[2]),
                senderName: "Customer",
                text: "AC stopped working completely. It's very hot in the living room."
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[2]),
                senderId: new mongoose.Types.ObjectId(userIds[7]),
                senderName: "Nischal Basnet",
                text: "I'm on my way now. I'll call you when I'm nearby."
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[2]),
                senderId: new mongoose.Types.ObjectId(userIds[2]),
                senderName: "Customer",
                text: "Please also check the compressor and the gas levels."
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[3]),
                senderId: new mongoose.Types.ObjectId(userIds[3]),
                senderName: "Customer",
                text: "I need a quote for painting the living room and two bedrooms."
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[3]),
                senderId: new mongoose.Types.ObjectId(userIds[8]),
                senderName: "Sabin Shrestha",
                text: "We can survey it Monday morning and provide an exact estimate. Does 11 AM work for you?"
            },
            {
                bookingId: new mongoose.Types.ObjectId(bookingIds[3]),
                senderId: new mongoose.Types.ObjectId(userIds[3]),
                senderName: "Customer",
                text: "Yes, 11 AM is perfect. Please bring the color sample book."
            }
        ];

        for (const messageData of messages) {
            const existing = await ChatMessageModel.findOne({
                bookingId: messageData.bookingId,
                text: messageData.text
            });
            if (!existing) {
                await ChatMessageModel.create(messageData);
                console.log(`  ✓ Created message in booking`);
            }
        }
    } catch (error) {
        console.error('Error seeding messages:', error);
        throw error;
    }
}

async function seedTickets() {
    try {
        console.log('\n🎫 Seeding Support Tickets...');

        const ticketCounter = Math.floor(Math.random() * 1000);
        
        const tickets = [
            {
                ticketId: `TKT-2026-${String(10001 + ticketCounter).slice(-5)}`,
                subject: "Booking not confirmed",
                category: "booking",
                description: "I booked a service 2 days ago but haven't received confirmation yet.",
                status: "Under Review" as const,
                technicianName: "Support Team"
            },
            {
                ticketId: `TKT-2026-${String(10002 + ticketCounter).slice(-5)}`,
                subject: "Payment issue",
                category: "payment",
                description: "I was charged twice for the same service. Please refund.",
                status: "In Progress" as const,
                technicianName: "Billing Department"
            },
            {
                ticketId: `TKT-2026-${String(10003 + ticketCounter).slice(-5)}`,
                subject: "Professional didn't show up",
                category: "service_quality",
                description: "The professional didn't arrive for the scheduled appointment.",
                status: "In Progress" as const,
                technicianName: "Complaint Officer"
            },
            {
                ticketId: `TKT-2026-${String(10004 + ticketCounter).slice(-5)}`,
                subject: "Poor service quality",
                category: "service_quality",
                description: "The work done was not up to the promised standard.",
                status: "Resolved" as const,
                technicianName: "Quality Assurance"
            },
            {
                ticketId: `TKT-2026-${String(10005 + ticketCounter).slice(-5)}`,
                subject: "Account verification issue",
                category: "account",
                description: "My account won't verify. I've submitted documents but no response.",
                status: "In Progress" as const,
                technicianName: "Account Support"
            }
        ];

        for (const ticketData of tickets) {
            const existing = await TicketModel.findOne({ ticketId: ticketData.ticketId });
            if (!existing) {
                await TicketModel.create(ticketData);
                console.log(`  ✓ Created ticket: ${ticketData.ticketId}`);
            }
        }
    } catch (error) {
        console.error('Error seeding tickets:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log('\n🌱 Starting Database Seeding...\n');
        
        await seedUsers();

        // Get user IDs for references
        const allUsers = await UserModel.find({});
        const proUsers = allUsers.filter(u => u.role === 'professional').slice(0, 5);
        const customerUsers = allUsers.filter(u => u.role !== 'professional' && u.role !== 'admin').slice(0, 4);
        
        if (customerUsers.length < 4) {
            // Create test customers if not enough
            const testCustomers = [];
            for (let i = 0; i < 4 - customerUsers.length; i++) {
                const hashedPassword = await bcrypt.hash('user123', 10);
                const user = new UserModel({
                    firstName: `Customer${i + 1}`,
                    lastName: 'User',
                    email: `customer${i + 1}@fixhub.com`,
                    username: `customer${i + 1}`,
                    password: hashedPassword,
                    role: 'customer',
                    phoneNumber: `984100000${20 + i}`,
                    status: 'active',
                    isVerified: true
                });
                await user.save();
                testCustomers.push(user);
                console.log(`✓ Created test customer: customer${i + 1}@fixhub.com`);
            }
            customerUsers.push(...testCustomers);
        }

        const proIds = proUsers.map(u => u._id.toString());
        const userIds = [...customerUsers.map(u => u._id.toString()), ...proIds];

        if (proIds.length > 0) {
            await seedServices(proIds);
        }

        // Get service IDs for bookings
        const allServices = await ServiceModel.find({});
        const serviceIds = allServices.slice(0, 4).map(s => s._id.toString());

        if (serviceIds.length > 0 && userIds.length > 0) {
            await seedBookings(userIds, serviceIds);
        }

        // Get booking IDs for messages
        const allBookings = await BookingModel.find({});
        const bookingIds = allBookings.map(b => b._id.toString());

        if (bookingIds.length > 0) {
            await seedMessages(bookingIds, userIds);
        }

        await seedTickets();

        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Users: ${allUsers.length}`);
        console.log(`   - Services: ${allServices.length}`);
        console.log(`   - Bookings: ${allBookings.length}`);
        console.log(`   - Messages: ${await ChatMessageModel.countDocuments()}`);
        console.log(`   - Tickets: ${await TicketModel.countDocuments()}\n`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

main();
