import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { pool } from "../config/db.js";
import { firestore } from "../config/firebase.js";
import { AppError } from "../middleware/errorHandler.js";

type MessageData = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp | string;
};

type ChatRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: Date;
};

async function getChat(chatId: string): Promise<ChatRow> {
  const result = await pool.query<ChatRow>(
    `SELECT id, user_a_id, user_b_id, created_at
     FROM chats WHERE id = $1`,
    [chatId],
  );

  if (result.rowCount === 0) {
    throw new AppError(404, "Chat not found");
  }

  return result.rows[0]!;
}

async function assertMember(
  chatId: string,
  userId: string,
): Promise<ChatRow> {
  const chat = await getChat(chatId);

  if (
    chat.user_a_id !== userId &&
    chat.user_b_id !== userId
  ) {
    throw new AppError(403, "User is not a member of this chat");
  }

  return chat;
}

function messagesCollection(chatId: string) {
  return firestore
    .collection("chats")
    .doc(chatId)
    .collection("messages");
}

export async function createOrGetChat(
  userAId: string,
  userBId: string,
) {
  if (userAId === userBId) {
    throw new AppError(400, "A chat requires two different users");
  }

  const users = await pool.query(
    `SELECT id FROM users WHERE id = ANY($1::uuid[])`,
    [[userAId, userBId]],
  );

  if (users.rowCount !== 2) {
    throw new AppError(404, "One or both users do not exist");
  }

  const [first, second] = [userAId, userBId].sort();

  const result = await pool.query<ChatRow>(
    `INSERT INTO chats (user_a_id, user_b_id)
     VALUES ($1, $2)
     ON CONFLICT (user_a_id, user_b_id)
     DO UPDATE SET user_a_id = EXCLUDED.user_a_id
     RETURNING id, user_a_id, user_b_id, created_at`,
    [first, second],
  );

  return { chatId: result.rows[0]!.id };
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string,
) {
  await assertMember(chatId, senderId);

  const cleanText = text.trim();

  if (!cleanText || cleanText.length > 10000) {
    throw new AppError(
      400,
      "Message text must contain 1–10000 characters",
    );
  }

  const ref = messagesCollection(chatId).doc();

  const message: MessageData = {
    id: ref.id,
    chatId,
    senderId,
    text: cleanText,
    createdAt: Timestamp.now(),
  };

  await ref.set(message);

  return message;
}

export async function getMessages(
  chatId: string,
  userId: string,
  limit: number,
) {
  await assertMember(chatId, userId);

  const snapshot = await messagesCollection(chatId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs
    .map((doc) => doc.data() as MessageData)
    .reverse();
}

export async function markMessageRead(
  chatId: string,
  messageId: string,
  userId: string,
) {
  await assertMember(chatId, userId);

  const messageRef = messagesCollection(chatId).doc(messageId);
  const message = await messageRef.get();

  if (!message.exists) {
    throw new AppError(404, "Message not found");
  }

  const receiptRef = messageRef
    .collection("readReceipts")
    .doc(userId);

  await receiptRef.set(
    {
      userId,
      readAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    chatId,
    messageId,
    userId,
    read: true,
  };
}

export async function updateLastSeen(
  chatId: string,
  messageId: string,
  userId: string,
) {
  await assertMember(chatId, userId);

  const messageRef = messagesCollection(chatId).doc(messageId);
  const message = await messageRef.get();

  if (!message.exists) {
    throw new AppError(404, "Message not found");
  }

  const lastSeenRef = firestore
    .collection("chats")
    .doc(chatId)
    .collection("lastSeen")
    .doc(userId);

  await lastSeenRef.set(
    {
      userId,
      messageId,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    chatId,
    userId,
    lastSeenMessageId: messageId,
  };
}

export async function listUserChats(userId: string) {
  const user = await pool.query(
    "SELECT id FROM users WHERE id = $1",
    [userId],
  );

  if (user.rowCount === 0) {
    throw new AppError(404, "User not found");
  }

  const result = await pool.query(
    `SELECT
       c.id AS "chatId",
       c.user_a_id AS "userAId",
       c.user_b_id AS "userBId",
       c.created_at AS "createdAt"
     FROM chats c
     WHERE c.user_a_id = $1 OR c.user_b_id = $1
     ORDER BY c.created_at DESC`,
    [userId],
  );

  return result.rows;
}