import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import { connectToMongoDB } from "../../database/mongodb.js";
import { NotificationModel } from "../../models/notification.model.js";

describe("Backend integration tests", () => {
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    await connectToMongoDB();
    agent = request.agent(app);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should return 404 for a missing API route", async () => {
    const res = await request(app).get("/api/v1/nonexistent");
    expect(res.status).toBe(404);
  });

  it("should require authentication for admin tickets endpoint", async () => {
    const res = await request(app).get("/api/v1/tickets/admin");
    expect(res.status).toBe(401);
  });

  it("should create a support ticket and notify admin users", async () => {
    const uniqueLabel = `E2E-${Date.now()}`;
    const loginRes = await agent
      .post("/api/v1/auth/login")
      .send({ email: "admin@fixhub.com", password: "admin123" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);

    const ticketRes = await request(app)
      .post("/api/v1/tickets")
      .send({
        subject: `${uniqueLabel} Playwright ticket`,
        category: "Other",
        description: `This ticket was created as part of an integration test: ${uniqueLabel}`,
      });

    expect(ticketRes.status).toBe(201);
    expect(ticketRes.body.success).toBe(true);
    expect(ticketRes.body.data).toHaveProperty("ticketId");

    const notificationsRes = await agent.get("/api/v1/notifications");
    expect(notificationsRes.status).toBe(200);
    expect(notificationsRes.body.success).toBe(true);
    expect(Array.isArray(notificationsRes.body.data)).toBe(true);
    expect(notificationsRes.body.data.some((n: any) => n.body.includes(uniqueLabel))).toBe(true);

    await NotificationModel.deleteMany({ body: { $regex: uniqueLabel } });
  });
});
