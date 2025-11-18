import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { PORT, MONGO_URI } from "./config";
import authRoutes from "./routes/auth";

async function start() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // -------------------------------
  // Root route (fixes "Cannot GET /")
  // -------------------------------
  app.get("/", (req, res) => {
    res.send(`
      <h1>Vidhatha Backend API</h1>
      <p>Server is running successfully.</p>

      <h3>Available Endpoints</h3>
      <ul>
        <li>GET /health</li>
        <li>POST /api/auth/login</li>
        <li>POST /api/auth/register-admin (dev only)</li>
        <li>GET /api/auth/me</li>
      </ul>
    `);
  });

  // -------------------------------
  // API Routes
  // -------------------------------
  app.use("/api/auth", authRoutes);

  // -------------------------------
  // Health Check
  // -------------------------------
  app.get("/health", (req, res) => {
    res.json({
      ok: true,
      env: process.env.NODE_ENV || "development",
      mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
  });

  // -------------------------------
  // DB + Server Start
  // -------------------------------
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

start();
