import dotenv from 'dotenv';
dotenv.config();

import type { Request, Response, NextFunction } from "express";
import { GoogleGenAI } from "@google/genai";
import { ApiResponseHelper } from "../../shared/utils/apihelper.util.js";

const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || process.env.API_KEY?.trim() || "";
const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim() || "";
const openRouterUrl = process.env.OPENROUTER_URL?.trim() || "https://openrouter.ai/v1/chat/completions";
const openRouterModel = process.env.OPENROUTER_MODEL?.trim() || "gpt-4o-mini";

const normalizeGeminiModel = (model?: string) => {
    const normalized = model?.trim().toLowerCase();
    if (!normalized) return undefined;
    if (normalized === "gemini-pro") return "gemini-2.5-pro";
    if (normalized === "gemini-1.5-flash") return "gemini-2.5-pro";
    if (normalized === "gemini-1.5-pro") return "gemini-2.5-pro";
    return normalized;
};

const requestedModel = normalizeGeminiModel(process.env.GEMINI_MODEL?.trim());

console.log("Gemini API Key loaded:", geminiApiKey ? "Yes" : "No");
console.log("Gemini API Key length:", geminiApiKey?.length);
console.log("OpenRouter API Key loaded:", openRouterApiKey ? "Yes" : "No");
console.log("OpenRouter URL:", openRouterUrl);
console.log("OpenRouter model:", openRouterModel);

const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
const isGeminiConfigured = Boolean(geminiApiKey);
const isOpenRouterConfigured = Boolean(openRouterApiKey);
const isAnyProviderConfigured = isGeminiConfigured || isOpenRouterConfigured;

export const getChatModelCandidates = (configuredModel?: string) => {
    const normalizedRequested = normalizeGeminiModel(configuredModel);
    const candidates = [normalizedRequested, "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite"]
        .filter((value): value is string => Boolean(value && value.trim()));

    return [...new Set(candidates)];
};

export const getOpenRouterModelCandidates = (configuredModel?: string) => {
    const candidates = [configuredModel?.trim(), openRouterModel]
        .filter((value): value is string => Boolean(value && value.trim()));

    return [...new Set(candidates)];
};

export const getFallbackResponse = (message: string) => {
    const trimmed = (message || "").trim().toLowerCase();
    const baseResponse = "I’m temporarily unavailable right now, but I can still help you browse trusted home services on FixHub.";

    if (!trimmed) {
        return baseResponse;
    }

    if (trimmed.includes("book") || trimmed.includes("technician") || trimmed.includes("plumber") || trimmed.includes("electric")) {
        return "I’m temporarily unavailable right now, but you can still book a trusted pro directly on FixHub by choosing the service category and time slot that fits your need.";
    }

    if (trimmed.includes("faucet") || trimmed.includes("leak") || trimmed.includes("dripping") || trimmed.includes("toilet")) {
        return "A quick first step is to shut off the water and check the fixture for a worn washer or loose connection. If it still leaks, book a local plumber on FixHub.";
    }

    if (trimmed.includes("payment") || trimmed.includes("escrow") || trimmed.includes("pay")) {
        return "FixHub uses secure escrow payments. Your payment is held safely until the service is completed to your satisfaction. We support eSewa, Khalti, and card payments.";
    }

    if (trimmed.includes("price") || trimmed.includes("cost") || trimmed.includes("expensive")) {
        return "Service prices vary by professional and service type. You can see pricing on each service page before booking. We also offer promo codes for discounts.";
    }

    if (trimmed.includes("what is") || trimmed.includes("about") || trimmed.includes("explain")) {
        return "FixHub connects you with trusted home service professionals in Nepal. We offer plumbing, electrical, AC repair, painting, cleaning, and more with secure payments.";
    }

    if (trimmed.includes("name") || trimmed.includes("who are you")) {
        return "I'm Fixie, your FixHub assistant. I help you find the right services and answer questions about our platform.";
    }

    if (trimmed.includes("help") || trimmed.includes("support") || trimmed.includes("contact")) {
        return "For support, you can reach us through the Contact page or email us at support@fixhub.com. We're here to help!";
    }

    return baseResponse;
};

const modelCandidates = getChatModelCandidates(requestedModel);

export const handleChat = async (req: Request, res: Response, next: NextFunction) => {
    let requestMessage = "";
    let requestHistory: unknown[] = [];

    try {
        const { message, history } = req.body;
        requestMessage = typeof message === "string" ? message : "";
        requestHistory = Array.isArray(history) ? history : [];

        if (!requestMessage.trim()) {
            return ApiResponseHelper.error(res, "Message is required", 400);
        }

        if (!isGeminiConfigured || !ai) {
            const fallbackResponse = getFallbackResponse(requestMessage);
            console.log("Gemini not configured, using fallback. isGeminiConfigured:", isGeminiConfigured, "ai:", !!ai);
            return ApiResponseHelper.success(
                res,
                {
                    response: fallbackResponse,
                    fallback: true,
                    fallbackReason: 'Gemini not configured',
                    providerError: 'No Gemini API key configured',
                    modelCandidates,
                },
                "Chatbot fallback response generated successfully"
            );
        }

        console.log("Gemini is configured, attempting to use real AI");

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



        let lastError: unknown = null;
        let lastErrorMessage = "";

        const createFormattedHistory = () => {
            const formattedHistory = Array.isArray(requestHistory)
                ? requestHistory.map((item: any) => ({
                    role: item.role === "model" || item.role === "assistant" ? "model" : "user",
                    parts: [{ text: item.text || item.message || "" }]
                }))
                : [];

            while (formattedHistory.length > 0 && formattedHistory[0]?.role !== "user") {
                formattedHistory.shift();
            }

            return formattedHistory;
        };

        const buildGeminiPrompt = (history: any[]) => {
            const historyText = history
                .map((item: any) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.parts.map((part: any) => part.text).join(" ")}`)
                .join("\n");

            return [
                systemInstruction,
                historyText ? `\n${historyText}` : "",
                `\nUser: ${requestMessage}`,
                "Assistant:",
            ].filter(Boolean).join("\n\n");
        };

        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const isRetryableGeminiError = (error: any) => {
            const message = (error?.message || "").toString().toLowerCase();
            return error?.status === 429 || message.includes("429") || message.includes("resource_exhausted") || message.includes("rate limit") || message.includes("quota");
        };

        const generateGeminiContentWithRetry = async (
            modelName: string,
            prompt: string,
            retries = 3,
            delayMs = 3000
        ) => {
            try {
                return await ai!.models.generateContent({
                    model: modelName,
                    contents: prompt,
                });
            } catch (error: any) {
                if (retries > 0 && isRetryableGeminiError(error)) {
                    console.warn(`Gemini rate limit hit for ${modelName}; retrying in ${delayMs}ms...`, error?.message || error);
                    await delay(delayMs);
                    return generateGeminiContentWithRetry(modelName, prompt, retries - 1, delayMs * 2);
                }
                throw error;
            }
        };

        const tryGemini = async () => {
            if (!isGeminiConfigured || !ai) {
                console.log("Gemini not configured, skipping Gemini attempt.");
                return null;
            }

            console.log("Attempting to use Gemini model candidates:", modelCandidates);
            for (const modelName of modelCandidates) {
                try {
                    console.log("Trying Gemini model:", modelName);

                    const prompt = buildGeminiPrompt(createFormattedHistory());
                    const result = await generateGeminiContentWithRetry(modelName, prompt);

                    const responseText = result.text || "";
                    console.log("Gemini response received from model", modelName, responseText);

                    return {
                        response: responseText,
                        provider: "Gemini",
                        model: modelName,
                    };
                } catch (error: any) {
                    const message = error?.message || String(error) || 'Unknown Gemini error';
                    console.error("Gemini model failed:", modelName, message, error);
                    lastError = error;
                    lastErrorMessage = message;
                }
            }

            console.error("Failed to generate a response with any Gemini model, last error:", lastErrorMessage, lastError);
            return null;
        };

        const tryOpenRouter = async () => {
            if (!isOpenRouterConfigured) {
                console.log("OpenRouter not configured, skipping OpenRouter attempt.");
                return null;
            }

            const openRouterCandidates = getOpenRouterModelCandidates(requestedModel);
            console.log("Attempting to use OpenRouter model candidates:", openRouterCandidates);

            for (const modelName of openRouterCandidates) {
                try {
                    console.log("Trying OpenRouter model:", modelName);

                    const openRouterResponse = await fetch(openRouterUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${openRouterApiKey}`,
                        },
                        body: JSON.stringify({
                            model: modelName,
                            messages: [
                                { role: 'system', content: systemInstruction },
                                { role: 'user', content: requestMessage },
                            ],
                            max_tokens: 1000,
                            temperature: 0.5,
                        }),
                    });

                    const openRouterData = await openRouterResponse.json();
                    console.log("OpenRouter raw response:", openRouterData);

                    if (!openRouterResponse.ok) {
                        const errorText = openRouterData.error?.message || openRouterData.message || JSON.stringify(openRouterData);
                        throw new Error(`OpenRouter error: ${errorText}`);
                    }

                    const choices = openRouterData.choices || [];
                    const firstChoice = Array.isArray(choices) ? choices[0] : null;
                    const responseText = firstChoice?.message?.content || firstChoice?.text || openRouterData?.response || "";

                    if (!responseText) {
                        throw new Error(`OpenRouter returned no text. full response: ${JSON.stringify(openRouterData)}`);
                    }

                    console.log("OpenRouter response received from model", modelName, responseText);

                    return {
                        response: responseText,
                        provider: "OpenRouter",
                        model: modelName,
                    };
                } catch (error: any) {
                    const message = error?.message || String(error) || 'Unknown OpenRouter error';
                    console.error("OpenRouter model failed:", modelName, message, error);
                    lastError = error;
                    lastErrorMessage = message;
                }
            }

            return null;
        };

        if (!isAnyProviderConfigured) {
            const fallbackResponse = getFallbackResponse(requestMessage);
            const providerCandidates = getChatModelCandidates(requestedModel);
            const openRouterCandidates = getOpenRouterModelCandidates(requestedModel);

            console.log("No AI provider configured, returning fallback response.");
            return ApiResponseHelper.success(
                res,
                {
                    response: fallbackResponse,
                    fallback: true,
                    fallbackReason: 'No AI provider configured',
                    providerError: 'No Gemini or OpenRouter API key configured',
                    modelCandidates: providerCandidates,
                    openRouterCandidates,
                },
                "Chatbot fallback response generated successfully"
            );
        }

        const providerOrder = isOpenRouterConfigured
            ? [tryOpenRouter, tryGemini]
            : [tryGemini];

        for (const attemptProvider of providerOrder) {
            const result = await attemptProvider();
            if (result) {
                console.log("Chatbot selected provider:", result.provider, "model:", result.model);
                return ApiResponseHelper.success(
                    res,
                    {
                        response: result.response,
                        provider: result.provider,
                        model: result.model,
                    },
                    "Chatbot response generated successfully"
                );
            }
        }

        console.error("Failed to generate a response with configured providers, last error:", lastErrorMessage, lastError);
        const fallbackResponse = getFallbackResponse(requestMessage);
        return ApiResponseHelper.success(
            res,
            {
                response: fallbackResponse,
                fallback: true,
                fallbackReason: 'Configured AI providers failed',
                providerError: lastErrorMessage || 'No provider response',
            },
            `Chatbot fallback response generated successfully (AI error: ${lastErrorMessage || 'No provider response'})`
        );
    } catch (error: any) {
        const errorMessage = error?.message || String(error) || 'Unknown Gemini error';
        console.error("Gemini API Error:", error);
        console.error("Error message:", errorMessage);
        console.error("Error stack:", error?.stack);
        return ApiResponseHelper.success(
            res,
            {
                response: getFallbackResponse(requestMessage),
                fallback: true,
                fallbackReason: 'AI provider error',
                providerError: errorMessage,
                modelCandidates,
            },
            `Chatbot fallback response generated successfully (AI error: ${errorMessage})`
        );
    }
};
