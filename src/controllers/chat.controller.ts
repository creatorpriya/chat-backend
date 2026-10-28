
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../middleware/errorHandler.js";
import * as chatService from "../services/chat.service.js";

function requiredString(
  value: unknown,
  field: string,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, `${field} is required`);
  }

  return value.trim();
}

function requiredParam(
  value: string | string[] | undefined,
  field: string,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, `${field} is required`);
  }

  return value.trim();
}

// 1. POST /chat/create
export async function createChat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userAId = requiredString(
      req.body.userAId,
      "userAId",
    );

    const userBId = requiredString(
      req.body.userBId,
      "userBId",
    );

    const result = await chatService.createOrGetChat(
      userAId,
      userBId,
    );

    res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
}

// 2. POST /chat/:chatId/message/send
export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const chatId = requiredParam(
      req.params.chatId,
      "chatId",
    );

    const senderId = requiredString(
      req.body.senderId,
      "senderId",
    );

    const text = requiredString(
      req.body.text,
      "text",
    );

    const message = await chatService.sendMessage(
      chatId,
      senderId,
      text,
    );

    res.status(201).json(message);
  } catch (error: unknown) {
    next(error);
  }
}

// 3. GET /chat/:chatId/messages?limit=50&userId=...
export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const chatId = requiredParam(
      req.params.chatId,
      "chatId",
    );

    const userId = requiredString(
      req.query.userId,
      "userId",
    );

    const rawLimit = req.query.limit ?? "50";
    const limit = Number(rawLimit);

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new AppError(
        400,
        "limit must be an integer between 1 and 100",
      );
    }

    const messages = await chatService.getMessages(
      chatId,
      userId,
      limit,
    );

    res.status(200).json({ messages });
  } catch (error: unknown) {
    next(error);
  }
}

// 4. POST /chat/:chatId/message/:messageId/read
export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const chatId = requiredParam(
      req.params.chatId,
      "chatId",
    );

    const messageId = requiredParam(
      req.params.messageId,
      "messageId",
    );

    const userId = requiredString(
      req.body.userId,
      "userId",
    );

    const result = await chatService.markMessageRead(
      chatId,
      messageId,
      userId,
    );

    res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
}

// 5. POST /chat/:chatId/lastseen
export async function updateLastSeen(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const chatId = requiredParam(
      req.params.chatId,
      "chatId",
    );

    const userId = requiredString(
      req.body.userId,
      "userId",
    );

    const messageId = requiredString(
      req.body.messageId,
      "messageId",
    );

    const result = await chatService.updateLastSeen(
      chatId,
      messageId,
      userId,
    );

    res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
}

// 6. GET /user/:userId/chats
export async function listUserChats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requiredParam(
      req.params.userId,
      "userId",
    );

    const chats = await chatService.listUserChats(
      userId,
    );

    res.status(200).json({ chats });
  } catch (error: unknown) {
    next(error);
  }
}
