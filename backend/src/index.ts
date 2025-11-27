// backend/src/index.ts
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { PORT, MONGO_URI } from "./config";

import authRoutes from "./routes/auth";
import programsRoutes from "./routes/programs";
import eventsRoutes from "./routes/events";
import uploadsRoutes from "./routes/uploads"; // local upload handler (multer -> local disk)
import rolesRoutes from "./routes/roles";
import rolesAdminRoutes from "./routes/rolesAdmin";
import uploadsCloudinary from "./routes/uploads-cloudinary";

async function start() {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // -------------------------------
  // Root route (fixes "Cannot GET /")
  // -------------------------------
  app.get("/", (req, res) => {
    res.send(`
      <h1 style="font-family: Arial;">Vidhatha Society Backend API</h1>
      <p>🎉 Server is running successfully.</p>

      <h3>📌 Available API Endpoints</h3>
      <ul>
        <li>GET /health</li>
        <li>POST /api/auth/login</li>
        <li>POST /api/auth/register-admin (dev only)</li>
        <li>GET /api/auth/me</li>
        <li>CRUD /api/programs</li>
        <li>CRUD /api/events</li>
        <li>POST /api/uploads (image uploads here)</li>
        <li>CRUD /api/roles</li>
      </ul>

      <p style="color: gray;">Backend running at: http://localhost:${PORT}</p>
    `);
  });

  // -------------------------------
  // API Routes
  // -------------------------------
  app.use("/api/auth", authRoutes);
  app.use("/api/programs", programsRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/roles", rolesRoutes);
  app.use("/api/admin/roles", rolesAdminRoutes);

  /**
   * Upload handling:
   * - If Cloudinary env vars are configured, mount the cloudinary router at /api/uploads
   *   so existing frontend calls to POST /api/uploads will use Cloudinary automatically.
   * - Keep the legacy local upload route available at /api/uploads/local as a fallback.
   * - If Cloudinary is NOT configured, keep the local upload route mounted at /api/uploads
   *   to avoid breaking existing behavior.
   */
  const hasCloudinary =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

  if (hasCloudinary) {
    console.log("✅ Cloudinary config detected. Mounting Cloudinary upload route at /api/uploads");
    app.use("/api/uploads", uploadsCloudinary);
    // keep local uploads available at /api/uploads/local for manual migration or fallback
    app.use("/api/uploads/local", uploadsRoutes);
    console.log("ℹ️ Local upload route still available at /api/uploads/local");
  } else {
    console.log("⚠️ Cloudinary not configured. Using local uploads at /api/uploads");
    app.use("/api/uploads", uploadsRoutes);
    // still expose cloudinary route (but it may fail if envs missing) - comment out if you prefer not to
    app.use("/api/uploads/cloudinary", uploadsCloudinary);
  }

  // -------------------------------
  // Serve Uploaded Files (Local Dev)
  // -------------------------------
  // Keep this so existing images saved to /uploads are still accessible.
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // -------------------------------
  // Health Check
  // -------------------------------
  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      env: process.env.NODE_ENV || "development",
      mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      time: new Date().toISOString(),
    });
  });

  // -------------------------------
  // Start Server + DB
  // -------------------------------
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

start();
