import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./config/db.js";

dotenv.config();

const port = Number(process.env.PORT ?? 5000);

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected");

    app.listen(port, () => {
      console.log(`Chat backend running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exitCode = 1;
  }
}

void startServer();