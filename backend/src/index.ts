import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { PORT, MONGO_URI } from "./config";
//import authRoutes from "./routes/auth"; needs to be fixed

async function start() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);

  // health
  app.get("/health", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "development" }));

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

start();
