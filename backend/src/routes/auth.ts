// backend/src/routes/auth.ts

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import User from "../models/User";
import Role, { IRole } from "../models/Role";
import { signJwt } from "../utils/jwt";
import { SUPERADMIN_PASSWORD } from "../config";
import { requireAuth } from "../middleware/auth";

const router = Router();

/* -----------------------------------------------------------
   RATE LIMITER — prevents brute-force login attacks
----------------------------------------------------------- */
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, try again later" },
});

/* -----------------------------------------------------------
   ZOD VALIDATION SCHEMAS
----------------------------------------------------------- */
const registerAdminSchema = z.object({
  secret: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roleKey: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/* -----------------------------------------------------------
   POST /api/auth/register-admin
   Dev-only — creates admin or superadmin user
   Returns token + user
----------------------------------------------------------- */
router.post("/register-admin", async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ error: "register-admin disabled in production" });
    }

    const parsed = registerAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });
    }

    const { secret, name, email, password, roleKey } = parsed.data;

    if (secret !== SUPERADMIN_PASSWORD) {
      return res.status(401).json({ error: "invalid or missing dev secret" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "user already exists" });

    let role: IRole | null = null;
    if (roleKey) {
      role = await Role.findOne({ key: roleKey });
      if (!role) return res.status(400).json({ error: `role '${roleKey}' not found` });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      roleKey: roleKey || "superadmin",
      role: role ? role._id : undefined,
    });

    const token = signJwt({
      userId: newUser._id.toString(),
      roleKey: newUser.roleKey,
    });

    return res.json({
      ok: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        roleKey: newUser.roleKey,
      },
    });
  } catch (err: any) {
    console.error("register-admin error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/* -----------------------------------------------------------
   POST /api/auth/login
----------------------------------------------------------- */
router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).populate("role");
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const roleKey = (user.role as any)?.key ?? user.roleKey ?? null;

    const token = signJwt({
      userId: user._id.toString(),
      roleKey,
    });

    return res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleKey,
      },
    });
  } catch (err: any) {
    console.error("login error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/* -----------------------------------------------------------
   GET /api/auth/me
   Protected route
----------------------------------------------------------- */
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "unauthorized" });

    return res.json({ ok: true, user });
  } catch (err: any) {
    console.error("me error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

export default router;
