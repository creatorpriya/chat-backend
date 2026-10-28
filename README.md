# Chat Backend API

A backend chat service built with **Node.js, TypeScript, PostgreSQL, and Firebase Cloud Firestore**. It supports one-to-one chat creation, message storage and retrieval, read receipts, last-seen tracking, and listing a user's chats.

## Features

- Create or retrieve an existing one-to-one chat.
- Send and store messages in Cloud Firestore.
- Retrieve chat messages with a configurable limit.
- Mark messages as read.
- Update a user's last-seen message.
- Retrieve all chats belonging to a user.
- Validate requests and handle API errors.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Firebase Admin SDK
- Cloud Firestore
- Thunder Client for API testing

## Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL
- A Firebase project with Cloud Firestore enabled
- Git

## Installation

Clone the repository and open the project directory:

```bash
git clone YOUR_PUBLIC_GITHUB_REPOSITORY_URL
cd chat-backend
npm install
```

## Environment Configuration

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/chat_backend
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

Download a Firebase Admin SDK service-account private key from Firebase Console → Project settings → Service accounts. Save it in the project root as `serviceAccountKey.json`.

**Security:** Never commit `.env` or `serviceAccountKey.json` to GitHub. Keep your credentials private.

## Database Setup

Create a PostgreSQL database named `chat_backend`.

Run the SQL statements in `sql/schema.sql` against that database to create the required tables and indexes.

To add test users, execute:

```sql
INSERT INTO users (name, email)
VALUES
    ('Priya', 'priya@example.com'),
    ('Test User', 'testuser@example.com')
ON CONFLICT (email) DO NOTHING;

SELECT id, name, email FROM users;
```

Use the returned UUIDs when testing the APIs.

In Firebase Console, create a Cloud Firestore database with the default database ID `(default)`.

## Run the Project

Start the development server:

```bash
npm run dev
```

The API will be available at:

`http://localhost:5000`

Check the health endpoint:

```http
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

Build the TypeScript project:

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

## API Endpoints

All endpoints run locally at `http://localhost:5000`.

### 1. Create or Get a Chat

**POST** `/chat/create`

Request body:

```json
{
  "userAId": "FIRST_USER_UUID",
  "userBId": "SECOND_USER_UUID"
}
```

Returns the chat ID. Repeated requests for the same user pair return the existing chat.

### 2. Send a Message

**POST** `/chat/:chatId/message/send`

Request body:

```json
{
  "senderId": "FIRST_USER_UUID",
  "text": "Hello! This is my first chat message."
}
```

Stores the message in Firestore and returns the message details.

### 3. Get Chat Messages

**GET** `/chat/:chatId/messages?userId=USER_UUID&limit=50`

Returns messages for the specified chat in chronological order.

### 4. Mark a Message as Read

**POST** `/chat/:chatId/message/:messageId/read`

Request body:

```json
{
  "userId": "SECOND_USER_UUID"
}
```

Stores a read receipt for the specified user and message.

### 5. Update Last Seen

**POST** `/chat/:chatId/lastseen`

Request body:

```json
{
  "userId": "SECOND_USER_UUID",
  "messageId": "MESSAGE_ID"
}
```

Records the user's last-seen message and update timestamp.

### 6. Get a User's Chats

**GET** `/user/:userId/chats`

Returns the chats associated with the specified user.

## Testing

The APIs were tested locally using Thunder Client in Visual Studio Code. The health check, chat creation, message sending, message retrieval, read receipt, last-seen, and user chat-list endpoints were exercised.

## Data Storage

- **PostgreSQL:** User records and chat metadata.
- **Cloud Firestore:** Messages, read receipts, and last-seen information.

## Project Structure

```text
chat-backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── app.ts
│   └── server.ts
├── sql/
│   └── schema.sql
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Notes

This project is an assignment implementation. Production deployment should include authenticated user identity, authorization checks, rate limiting, input validation, logging, and appropriate Firestore access controls.
