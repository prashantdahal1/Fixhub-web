import { Router } from "express";
import { handleChat } from "./chatbot.controller.js";

const router = Router();

router.post("/", handleChat);

export default router;
