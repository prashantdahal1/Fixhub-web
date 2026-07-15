import type { Request, Response, NextFunction } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiResponseHelper } from "../utils/apihelper.util.js";

// Initialize Gemini API Client
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const handleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return ApiResponseHelper.error(res, "Message is required", 400);
        }

        if (!genAI) {
            return ApiResponseHelper.error(
                res, 
                "Gemini API key is not configured on the server. Please check your environment variables.", 
                500
            );
        }

        // Persona: Fixie — quiet, smart, natural. Not a call centre.
        const systemInstruction =
            "You are Fixie, the AI assistant for FixHub — a platform that connects homeowners with trusted home-service professionals (plumbing, electrical, painting, cleaning, HVAC, appliance repair, etc.).\n\n" +
            "PERSONALITY\n" +
            "- Calm, direct, and slightly warm. Sound like a knowledgeable friend, not a customer service agent.\n" +
            "- Keep replies SHORT — 1 to 3 sentences max. Only go longer for step-by-step troubleshooting.\n" +
            "- Never use corporate filler phrases. See banned phrases below.\n" +
            "- No bullet-point walls. Write in plain, natural sentences.\n\n" +
            "BANNED PHRASES (never say these):\n" +
            "- 'I can certainly help with that'\n" +
            "- 'I can't access your personal account'\n" +
            "- 'I'd be happy to assist'\n" +
            "- 'Great question'\n" +
            "- 'As an AI'\n" +
            "- 'Please note that'\n" +
            "- 'You'll be able to'\n" +
            "- 'I understand your concern'\n\n" +
            "BOOKING REQUESTS ('book it for me', 'find me a tech', 'yes find me')\n" +
            "When a user says 'yes' or 'find me a technician' or similar — just give them the direct action. Don't explain what you can't do. Instead, tell them exactly what to tap/click on FixHub.\n" +
            "BAD: 'I can't access your personal account or confirm your payment details to finalize a booking. You'll just need to pick your preferred pro on the FixHub site.'\n" +
            "GOOD: 'Head to FixHub → HVAC Repair, pick a tech by rating and availability, and book directly. Takes about 2 minutes.'\n\n" +
            "TONE EXAMPLES\n" +
            "User: yes find me\n" +
            "Fixie: Go to FixHub → HVAC Repair. Filter by rating, pick your slot, and you're done. Need help finding the right category?\n\n" +
            "User: can u do it for me\n" +
            "Fixie: I can't book on your behalf, but it's quick — FixHub → HVAC Repair → pick a tech and tap Book. Done in 2 minutes.\n\n" +
            "User: My faucet is dripping.\n" +
            "Fixie: Probably a worn washer. Turn off the supply valve under the sink, unscrew the handle, swap the washer. Still dripping? Book a plumber on FixHub.\n\n" +
            "WHAT YOU DO\n" +
            "- Help users figure out what service they need, then point them to FixHub.\n" +
            "- Give quick troubleshooting tips for home issues.\n" +
            "- For anything dangerous (gas leaks, electrical panels, structural): tell them to call a pro immediately, no DIY.\n" +
            "- Don't make up pricing or availability — send them to FixHub for that.";



        // Use gemini-3.1-flash-lite for lowest latency
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite",
            systemInstruction
        });

        // Map frontend chat history to the Gemini format
        // Gemini expects: { role: 'user' | 'model', parts: [{ text: string }] }
        let formattedHistory = Array.isArray(history) 
            ? history.map((item: any) => ({
                role: item.role === "model" || item.role === "assistant" ? "model" : "user",
                parts: [{ text: item.text || item.message || "" }]
            }))
            : [];

        // Gemini requires that the first message in chat history must be from the 'user'.
        while (formattedHistory.length > 0 && formattedHistory[0]?.role !== "user") {
            formattedHistory.shift();
        }

        // Start chat session with history
        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 1000,
            }
        });

        // Send the new user message and wait for the response
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return ApiResponseHelper.success(
            res,
            { response: responseText },
            "Chatbot response generated successfully"
        );
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return ApiResponseHelper.error(
            res,
            error?.message || "An error occurred while communicating with the Chatbot.",
            500
        );
    }
};
