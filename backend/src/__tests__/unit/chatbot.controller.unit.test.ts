import { jest } from '@jest/globals';

const mockGenerateContent = jest.fn();

jest.unstable_mockModule('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: mockGenerateContent,
    };
  },
}));

const { handleChat } = await import('../../modules/chat/chatbot.controller.js');

describe('chatbot controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  it('falls back to a friendly response when Gemini hits a quota/rate-limit error', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Quota exceeded for free tier requests'));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    await handleChat(
      { body: { message: 'Help me find a plumber', history: [] } } as any,
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          response: expect.stringContaining('temporarily unavailable'),
        }),
      }),
    );
  });
});
