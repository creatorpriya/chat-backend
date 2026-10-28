import { Router } from "express";
import {
  createChat,
  sendMessage,
  getMessages,
  markRead,
  updateLastSeen,
} from "../controllers/chat.controller.js";

const router = Router();

router.post("/create", createChat);

router.post("/:chatId/message/send", sendMessage);

router.get("/:chatId/messages", getMessages);

router.post(
  "/:chatId/message/:messageId/read",
  markRead,
);

router.post("/:chatId/lastseen", updateLastSeen);

export default router;