import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

interface AIAnalysisResult {
  title: string;
  description: string;
  shortDescription: string;
  category?: string;
  tags: string[];
}

/**
 * AI Image Analysis Utility
 * Analyzes service images to auto-generate descriptions, titles, and metadata
 * Falls back to smart defaults when AI APIs are unavailable
 */

// Smart defaults based on service categories
const categoryTemplates: Record<string, {
  titles: string[];
  descriptions: string[];
  shortDescriptions: string[];
  tags: string[];
}> = {
  electrician: {
    titles: [
      "Electrical Wiring & Circuit Repair",
      "Home Electrical Installation Services", 
      "Emergency Electrician Available 24/7",
      "Panel Upgrade & Circuit Breaker Services",
      "Lighting Installation & Fixture Repair",
      "Electrical Safety Inspection Services",
      "Commercial & Residential Electrical Work",
      "Power Outlet & Switch Installation",
      "Electrical Troubleshooting & Diagnosis",
      "Complete Home Rewiring Services"
    ],
    descriptions: [
      "I handle all types of electrical work - from fixing faulty outlets and switches to complete home rewiring. I use proper safety protocols and quality materials to ensure your electrical system works reliably and safely.",
      "Need electrical repairs or installations? I can help with circuit breaker issues, lighting fixtures, ceiling fans, and more. I focus on identifying the root cause of electrical problems and providing lasting solutions.",
      "From minor electrical fixes to major installations, I cover it all. My services include wiring repairs, panel upgrades, safety inspections, and emergency electrical work. I make sure everything meets safety standards.",
      "I specialize in residential and commercial electrical services. Whether you need new lighting installed, circuits repaired, or a complete electrical system upgrade, I have the expertise to get the job done right.",
      "Electrical issues can be dangerous - that's why I prioritize safety and quality workmanship. I handle everything from simple outlet repairs to complex wiring projects with proper permits and inspections."
    ],
    shortDescriptions: [
      "Expert electrical repairs and installations",
      "24/7 emergency electrical services available",
      "Certified electrician for home and office",
      "Complete electrical solutions with safety focus",
      "Professional wiring and circuit repair services"
    ],
    tags: ["wiring", "repair", "installation", "safety", "certified", "emergency", "circuits", "lighting"]
  },
  plumber: {
    titles: [
      "Pipe Leak Detection & Repair",
      "Bathroom & Kitchen Plumbing Services",
      "Emergency Plumber - Quick Response",
      "Drain Cleaning & Unclogging Services",
      "Water Heater Installation & Repair",
      "Pipe Replacement & New Installation",
      "Faucet & Fixture Repair Services",
      "Sewer Line Inspection & Repair",
      "Residential & Commercial Plumbing",
      "Complete Plumbing Maintenance Services"
    ],
    descriptions: [
      "I fix all types of plumbing problems - from leaky faucets and running toilets to burst pipes and sewer backups. I use modern tools to quickly identify issues and provide lasting repairs.",
      "Need a plumber? I handle everything from minor leaks to major pipe replacements. My services include drain cleaning, water heater repair, fixture installation, and emergency plumbing calls.",
      "From fixing dripping faucets to installing new plumbing systems, I cover all residential and commercial plumbing needs. I focus on finding the source of problems and fixing them right the first time.",
      "I specialize in leak detection, pipe repairs, and drain cleaning. Whether you have a clogged drain, leaking pipe, or need a new water heater installed, I have the tools and expertise to help.",
      "Plumbing issues can cause serious damage if not addressed quickly. I provide fast, reliable plumbing services with transparent pricing and quality workmanship on every job."
    ],
    shortDescriptions: [
      "Expert leak detection and pipe repair",
      "24/7 emergency plumbing services",
      "Complete drain cleaning and unclogging",
      "Professional water heater installation",
      "Residential and commercial plumbing work"
    ],
    tags: ["leaks", "pipes", "installation", "repair", "emergency", "drain", "water heater", "faucets"]
  },
  ac_repair: {
    titles: [
      "AC Repair & Gas Refilling Services",
      "Split AC Installation & Maintenance",
      "Window AC Repair Specialist",
      "HVAC System Repair & Servicing",
      "Air Conditioner Gas Charging",
      "AC Not Cooling? Quick Fix Available",
      "Central AC Maintenance Services",
      "AC Compressor Repair & Replacement",
      "Residential & Commercial AC Services",
      "Complete AC Cleaning & Servicing"
    ],
    descriptions: [
      "I fix all types of AC problems - from cooling issues and gas leaks to compressor failures. I work on both split and window ACs, using proper tools to diagnose problems accurately and provide effective repairs.",
      "AC not cooling properly? I can help with gas refilling, filter cleaning, and compressor repairs. I handle all major brands and provide regular maintenance to keep your AC running efficiently.",
      "From installing new AC units to repairing old ones, I cover all air conditioning services. My work includes gas charging, coil cleaning, electrical repairs, and complete system overhauls.",
      "I specialize in AC troubleshooting and repair. Whether your AC is making strange noises, not cooling, or has a gas leak, I have the expertise to fix it quickly and affordably.",
      "Regular AC maintenance is important for efficiency and longevity. I provide comprehensive servicing including cleaning, gas checks, and performance optimization for both residential and commercial units."
    ],
    shortDescriptions: [
      "Expert AC repair and gas refilling",
      "Split and window AC installation services",
      "Quick AC troubleshooting and repair",
      "Complete AC maintenance and cleaning",
      "HVAC system repair and servicing"
    ],
    tags: ["ac", "repair", "installation", "maintenance", "cooling", "hvac", "gas", "compressor"]
  },
  painter: {
    titles: [
      "Professional Painting Services",
      "Expert Interior & Exterior Painting",
      "Complete Painting Solutions",
      "Quality Paint Work for Homes & Offices"
    ],
    descriptions: [
      "Professional painting services for interior and exterior surfaces. We provide surface preparation, color consultation, premium quality paints, and clean execution. Specializing in residential, commercial, and industrial painting with lasting results.",
      "Expert painting services with attention to detail. From wall painting to texture designs, we handle all types of painting projects using quality materials and skilled craftsmen for flawless finishes.",
      "Complete painting solutions including waterproofing, wall textures, decorative painting, and color schemes. Our team ensures proper surface preparation and clean, timely project completion."
    ],
    shortDescriptions: [
      "Professional interior and exterior painting services",
      "Expert painter for homes and commercial spaces",
      "Quality painting with color consultation"
    ],
    tags: ["painting", "interior", "exterior", "waterproofing", "texture", "decoration"]
  },
  carpenter: {
    titles: [
      "Expert Carpentry Services",
      "Professional Woodwork & Furniture",
      "Custom Carpentry Solutions",
      "Skilled Carpenter for All Woodwork"
    ],
    descriptions: [
      "Professional carpentry services including furniture making, repairs, and custom woodwork. Our skilled carpenters handle everything from minor repairs to complete furniture creation with quality materials and craftsmanship.",
      "Expert carpentry for all your woodwork needs. We specialize in furniture repair, custom shelving, door installation, cabinet making, and structural woodwork with precision and durability.",
      "Complete carpentry solutions from design to installation. Services include furniture creation, wood repairs, flooring, partition work, and custom woodworking tailored to your requirements."
    ],
    shortDescriptions: [
      "Expert carpentry and furniture services",
      "Professional woodwork and custom furniture",
      "Skilled carpenter for repairs and installations"
    ],
    tags: ["carpentry", "furniture", "woodwork", "repair", "custom", "installation"]
  },
  cleaner: {
    titles: [
      "Professional Cleaning Services",
      "Expert Home & Office Cleaning",
      "Complete Cleaning Solutions",
      "Deep Cleaning Specialists"
    ],
    descriptions: [
      "Professional cleaning services for residential and commercial spaces. We provide deep cleaning, regular maintenance, move-in/move-out cleaning, and specialized cleaning services using eco-friendly products and trained staff.",
      "Expert cleaning services with attention to detail. From regular house cleaning to deep cleaning for offices and homes, we ensure thorough sanitization and organized spaces with flexible scheduling.",
      "Complete cleaning solutions including carpet cleaning, window cleaning, deep sanitization, and maintenance cleaning. Our team uses professional equipment and safe cleaning agents for optimal results."
    ],
    shortDescriptions: [
      "Professional residential and commercial cleaning",
      "Expert deep cleaning and maintenance services",
      "Complete cleaning solutions with eco-friendly products"
    ],
    tags: ["cleaning", "deep cleaning", "sanitization", "maintenance", "eco-friendly"]
  },
  geyser: {
    titles: [
      "Professional Geyser Services",
      "Expert Water Heater Repair & Installation",
      "Complete Geyser Solutions",
      "Geyser Maintenance Specialists"
    ],
    descriptions: [
      "Professional geyser services including installation, repair, and maintenance. Our technicians handle all types of water heaters - electric, gas, and solar - with expertise in heating element replacement, thermostat repair, and gas filling.",
      "Expert geyser repair and installation services. We diagnose heating issues efficiently, replace faulty components, and provide regular maintenance to ensure optimal performance and energy efficiency.",
      "Complete water heater solutions from installation to repairs. Specializing in geyser servicing, element replacement, thermostat calibration, and safety checks for reliable hot water supply."
    ],
    shortDescriptions: [
      "Professional geyser repair and installation services",
      "Expert water heater maintenance and repair",
      "Complete geyser solutions for all types"
    ],
    tags: ["geyser", "water heater", "repair", "installation", "maintenance", "heating"]
  },
  appliance_repair: {
    titles: [
      "Expert Appliance Repair Services",
      "Professional Home Appliance Repair",
      "Complete Appliance Solutions",
      "Appliance Maintenance Specialists"
    ],
    descriptions: [
      "Professional appliance repair services for all major home appliances. Our technicians repair refrigerators, washing machines, microwaves, ovens, and more with genuine parts and warranty support.",
      "Expert home appliance repair with quick diagnosis and efficient solutions. We handle all brands and types of appliances, from minor fixes to major repairs, with service at your convenience.",
      "Complete appliance solutions including repair, maintenance, and installation. Specializing in kitchen appliances, laundry equipment, and electronic home devices with skilled technicians."
    ],
    shortDescriptions: [
      "Expert home appliance repair services",
      "Professional repair for all major appliances",
      "Complete appliance maintenance and solutions"
    ],
    tags: ["appliances", "repair", "maintenance", "refrigerator", "washing machine", "microwave"]
  },
  pest_control: {
    titles: [
      "Professional Pest Control Services",
      "Expert Pest Removal & Prevention",
      "Complete Pest Management",
      "Safe Pest Control Solutions"
    ],
    descriptions: [
      "Professional pest control services for residential and commercial properties. We provide safe and effective pest elimination including termites, rodents, cockroaches, and bed bugs with eco-friendly methods.",
      "Expert pest removal and prevention services. Our trained technicians identify pest problems, implement targeted treatments, and provide preventive measures to keep your property pest-free.",
      "Complete pest management solutions using safe and effective methods. Services include termite treatment, rodent control, insect elimination, and regular preventive maintenance."
    ],
    shortDescriptions: [
      "Professional pest control and elimination services",
      "Expert pest removal with safe methods",
      "Complete pest management solutions"
    ],
    tags: ["pest control", "termites", "rodents", "elimination", "prevention", "safe"]
  },
  other: {
    titles: [
      "Professional Home Services",
      "Expert Home Maintenance",
      "Complete Home Solutions",
      "Quality Home Services"
    ],
    descriptions: [
      "Professional home services tailored to your needs. We provide quality workmanship for various home maintenance and improvement tasks with skilled professionals and guaranteed satisfaction.",
      "Expert home maintenance and repair services. From minor fixes to major projects, our team handles diverse home service needs with efficiency and attention to detail.",
      "Complete home solutions including maintenance, repairs, and improvements. We offer comprehensive services to keep your home in excellent condition with reliable professionals."
    ],
    shortDescriptions: [
      "Professional home maintenance services",
      "Expert home repair and improvement",
      "Complete home solutions for all needs"
    ],
    tags: ["home services", "maintenance", "repair", "professional", "quality"]
  }
};

/**
 * Analyze image and generate service metadata
 * Uses AI APIs when available, falls back to smart defaults
 */
export async function analyzeServiceImage(
  imagePath: string,
  category?: string
): Promise<AIAnalysisResult> {
  try {
    // Check if image file exists
    if (!fs.existsSync(imagePath)) {
      logger.warn(`Image file not found: ${imagePath}, using fallback`);
      return generateFallbackResponse(category);
    }

    // Try to use AI API if configured
    const aiResult = await tryAIAnalysis(imagePath, category);
    if (aiResult) {
      return aiResult;
    }

    // Fall back to smart defaults
    logger.info('AI analysis not available, using smart defaults');
    return generateFallbackResponse(category);

  } catch (error) {
    logger.error('Error in image analysis:', error);
    return generateFallbackResponse(category);
  }
}

/**
 * Attempt AI analysis using configured APIs
 */
async function tryAIAnalysis(
  imagePath: string,
  category?: string
): Promise<AIAnalysisResult | null> {
  // Check for available AI APIs
  const hasGemini = process.env.GEMINI_API_KEY?.trim();
  const hasCustomAI = process.env.CUSTOM_AI_API_KEY?.trim() && process.env.CUSTOM_AI_URL?.trim();

  if (!hasGemini && !hasCustomAI) {
    return null;
  }

  try {
    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Try Gemini if available
    if (hasGemini) {
      return await analyzeWithGemini(base64Image, category);
    }

    // Try Custom AI if available
    if (hasCustomAI) {
      return await analyzeWithCustomAI(base64Image, category);
    }

    return null;
  } catch (error) {
    logger.warn('AI analysis failed, falling back to defaults:', error);
    return null;
  }
}

/**
 * Analyze image using Google Gemini Vision
 */
async function analyzeWithGemini(
  base64Image: string,
  category?: string
): Promise<AIAnalysisResult | null> {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!.trim() });
    
    const prompt = `You are analyzing a real service image for a home services marketplace. Look closely at the actual image content - tools, equipment, work environment, materials, and context.

Based on what you SEE in this image (not generic templates), generate:
1. A specific, descriptive service title (2-6 words) that matches the actual work shown
2. A detailed description (2-3 sentences) describing the specific service, tools, or work visible
3. A short description (1 sentence, under 15 words) that captures the essence
4. 5-6 relevant tags based on visible elements
5. Suggested category if not provided

Category context: ${category || 'home services'}

IMPORTANT: 
- Look at the actual image content
- Be specific to what you see (tools, materials, work type)
- Avoid generic phrases like "quality service" or "professional work"
- Use specific details visible in the image
- Make it sound like a real service provider describing their actual work

Respond in JSON format:
{
  "title": "...",
  "description": "...", 
  "shortDescription": "...",
  "tags": ["...", "..."],
  "category": "..."
}`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg'
      }
    };

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [prompt, imagePart],
    });

    const response = result.text || "";
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || 'Professional Service',
        description: parsed.description || 'Quality service provided by experienced professionals.',
        shortDescription: parsed.shortDescription || 'Professional service',
        category: parsed.category || category,
        tags: parsed.tags || ['professional', 'service', 'quality']
      };
    }

    return null;
  } catch (error) {
    logger.warn('Gemini analysis failed:', error);
    return null;
  }
}

/**
 * Analyze image using Custom AI API
 */
async function analyzeWithCustomAI(
  base64Image: string,
  category?: string
): Promise<AIAnalysisResult | null> {
  try {
    const customAIUrl = process.env.CUSTOM_AI_URL!.trim();
    const customAIKey = process.env.CUSTOM_AI_API_KEY!.trim();

    const response = await fetch(customAIUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customAIKey}`
      },
      body: JSON.stringify({
        image: base64Image,
        category: category,
        task: 'service_analysis'
      })
    });

    if (!response.ok) {
      throw new Error(`Custom AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      title: data.title || 'Professional Service',
      description: data.description || 'Quality service provided by experienced professionals.',
      shortDescription: data.shortDescription || 'Professional service',
      category: data.category || category,
      tags: data.tags || ['professional', 'service', 'quality']
    };
  } catch (error) {
    logger.warn('Custom AI analysis failed:', error);
    return null;
  }
}

/**
 * Generate fallback response using smart defaults
 */
function generateFallbackResponse(category?: string): AIAnalysisResult {
  const cat = category || 'other';
  const template = categoryTemplates[cat] || categoryTemplates['other'];
  
  if (!template) {
    // Ultimate fallback if template is missing
    return {
      title: 'Professional Service',
      description: 'Quality service provided by experienced professionals.',
      shortDescription: 'Professional service',
      category: cat,
      tags: ['professional', 'service', 'quality']
    };
  }
  
  // Random selection for variety
  const randomIndex = Math.floor(Math.random() * template.titles.length);
  
  return {
    title: template.titles[randomIndex] || 'Professional Service',
    description: template.descriptions[randomIndex] || 'Quality service provided by experienced professionals.',
    shortDescription: template.shortDescriptions[randomIndex] || 'Professional service',
    category: cat,
    tags: template.tags || ['professional', 'service', 'quality']
  };
}

/**
 * Generate service metadata from category alone (no image)
 */
export function generateServiceMetadata(category: string): AIAnalysisResult {
  return generateFallbackResponse(category);
}
