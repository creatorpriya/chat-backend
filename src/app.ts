import express from "express";
import chatRoutes from "./routes/chat.routes.js";
import userRoutes from "./routes/user.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/chat", chatRoutes);
app.use("/user", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;