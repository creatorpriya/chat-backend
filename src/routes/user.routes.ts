import { Router } from "express";
import { listUserChats } from "../controllers/chat.controller.js";

const router = Router();

router.get("/:userId/chats", listUserChats);

export default router;