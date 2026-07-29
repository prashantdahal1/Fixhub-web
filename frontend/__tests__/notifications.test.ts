import { fetchNotifications } from "../lib/api/notifications";

describe("fetchNotifications", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns an empty array when the notification request is unauthorized", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    (global as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(fetchNotifications()).resolves.toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("returns an empty array when the request fails with a network error", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    (global as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchNotifications()).resolves.toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
  });
});
