import { getChatModelCandidates, getFallbackResponse } from "../chatbot.controller.js";

describe("getChatModelCandidates", () => {
  it("prefers the configured model and adds stable fallbacks", () => {
    expect(getChatModelCandidates("gemini-2.0-flash")).toEqual([
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest"
    ]);
  });

  it("ignores empty values and removes duplicates", () => {
    expect(getChatModelCandidates("   ")).toEqual([
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-2.0-flash"
    ]);
  });

  it("gives a practical plumbing fallback response when the AI service fails", () => {
    expect(getFallbackResponse("Help me fix a faucet")).toContain("plumber");
  });

  it("gives a booking fallback response for booking questions", () => {
    expect(getFallbackResponse("Can you book a technician for me")).toContain("book");
  });
});
