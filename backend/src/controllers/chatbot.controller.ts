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

        // Use gemini-3.1-flash-lite for lowest latency
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

        // Map frontend chat history to the Gemini format
        // Gemini expects: { role: 'user' | 'model', parts: [{ text: string }] }
        let formattedHistory = Array.isArray(history) 
            ? history.map((item: any) => ({
                role: item.role === "model" || item.role === "assistant" ? "model" : "user",
                parts: [{ text: item.text || item.message || "" }]
            }))
            : [];

        // Gemini requires that the first message in chat history must be from the 'user'.
        while (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
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
