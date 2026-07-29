import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ServiceModel } from '../models/service.model.js';
import { UserModel } from '../models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fixhub';

const CATEGORY_PRO_EMAILS: Record<string, string> = {
  electrician: "rambehadur.tamang@fixhub.com",
  plumber: "harendra.prasad@fixhub.com",
  ac_repair: "nischal.basnet@fixhub.com",
  painter: "bikram.thapa@fixhub.com",
  carpenter: "sabin.shrestha@fixhub.com",
  cleaner: "rita.devi@fixhub.com",
  geyser: "ramesh.adhikari@fixhub.com",
  appliance_repair: "santosh.giri@fixhub.com",
  pest_control: "rohan.gurung@fixhub.com",
  other: "prem.bahadur@fixhub.com",
};

const servicesToSeed: any[] = [
  {
    title: "Electrical Wiring & Repair",
    slug: "electrical-wiring-repair",
    category: "electrician",
    description: "Complete electrical wiring, circuit fixes, socket installation and load management by certified electricians. We ensure safety and compliance with all local regulations.",
    shortDescription: "Full home wiring, circuit fixes, socket installation and load management.",
    basePrice: 800,
    priceUnit: "flat",
    rating: 4.8,
    reviewCount: 124,
    imageUrl: "/images/services/nepali_electrician_1783964756236.png",
    tags: ["wiring", "repair", "electrical"],
    specifications: [
      { label: "Warranty", value: "6 Months" },
      { label: "Safety Check", value: "Included" }
    ],
    isActive: true,
    isCertified: true,
    estimatedDuration: "1–3 hours"
  },
  {
    title: "Plumbing Leak Fix",
    slug: "plumbing-leak-fix",
    category: "plumber",
    description: "Expert pipe leak detection and repair, tap replacement, drain cleaning and bathroom fixture installation.",
    shortDescription: "Pipe leak detection and repair, tap replacement, drain cleaning.",
    basePrice: 600,
    priceUnit: "flat",
    rating: 4.6,
    reviewCount: 89,
    imageUrl: "/images/services/nepali_plumber_1783964771194.png",
    tags: ["plumbing", "leak", "pipe"],
    specifications: [
      { label: "Warranty", value: "3 Months" },
      { label: "Response Time", value: "Within 2 Hours" }
    ],
    isActive: true,
    isCertified: true,
    estimatedDuration: "1–2 hours"
  },
  {
    title: "AC Service & Deep Clean",
    slug: "ac-service-deep-clean",
    category: "ac_repair",
    description: "Full AC tune-up including filter wash, coil cleaning, gas refill check and cooling performance test.",
    shortDescription: "Full AC tune-up including filter wash, coil cleaning, gas refill check.",
    basePrice: 1200,
    priceUnit: "flat",
    rating: 4.9,
    reviewCount: 210,
    imageUrl: "/images/services/nepali_ac_repair_1783964785411.png",
    tags: ["ac", "cooling", "maintenance"],
    specifications: [
      { label: "Cooling Check", value: "Included" },
      { label: "Gas Check", value: "Included" }
    ],
    isActive: true,
    isCertified: true,
    estimatedDuration: "2–3 hours"
  },
  {
    title: "Interior Wall Painting",
    slug: "interior-wall-painting",
    category: "painter",
    description: "Professional interior painting with premium finish. Includes wall prep, primer, and 2 coats of paint.",
    shortDescription: "Professional interior painting with premium finish.",
    basePrice: 18,
    priceUnit: "per_sqft",
    rating: 4.7,
    reviewCount: 67,
    imageUrl: "/images/services/nepali_painter_1783964798022.png",
    tags: ["painting", "interior", "walls"],
    specifications: [
      { label: "Paint Quality", value: "Premium" },
      { label: "Coats", value: "2 Coats + Primer" }
    ],
    isActive: true,
    isCertified: true,
    estimatedDuration: "1–2 days"
  },
  {
    title: "Carpenter & Furniture Repair",
    slug: "carpenter-furniture-repair",
    category: "carpenter",
    description: "Door fixing, cabinet repair, custom shelf installation and furniture assembly by skilled carpenters.",
    shortDescription: "Door fixing, cabinet repair, custom shelf installation.",
    basePrice: 700,
    priceUnit: "flat",
    rating: 4.5,
    reviewCount: 43,
    imageUrl: "/images/services/nepali_carpenter_1783964811350.png",
    tags: ["woodwork", "furniture", "repair"],
    specifications: [
      { label: "Material", value: "Not included" }
    ],
    isActive: true,
    isCertified: false,
    estimatedDuration: "2–4 hours"
  }
];

async function seedServices() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        for (const service of servicesToSeed) {
            const proEmail = (CATEGORY_PRO_EMAILS[service.category] || CATEGORY_PRO_EMAILS.other) ?? "";
            let proUser;
            if (typeof proEmail === "string" && proEmail.length > 0) {
                proUser = await UserModel.findOne({ email: proEmail } as any);
            }

            const payload = {
                ...service,
                professionalId: proUser?._id,
            };

            const existing = await ServiceModel.findOne({ slug: service.slug });
            if (!existing) {
                await ServiceModel.create(payload);
                console.log(`Created service: ${service.title} (pro: ${proUser ? proUser.firstName + ' ' + proUser.lastName : 'None'})`);
            } else {
                await ServiceModel.updateOne({ slug: service.slug }, { $set: payload });
                console.log(`Updated service: ${service.title} (pro: ${proUser ? proUser.firstName + ' ' + proUser.lastName : 'None'})`);
            }
        }

        console.log('Services seeded and updated successfully with professional accounts!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding services:', error);
        process.exit(1);
    }
}

seedServices();
