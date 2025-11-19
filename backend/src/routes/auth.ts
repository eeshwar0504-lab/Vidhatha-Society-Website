// backend/src/routes/auth.ts

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Role, { IRole } from "../models/Role";
import { signJwt } from "../utils/jwt";
import { isEmail } from "../utils/validators";
import { SUPERADMIN_PASSWORD } from "../config";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * POST /api/auth/register-admin
 * Dev-only registration for superadmin/admin users.
 * Guarded by SUPERADMIN_PASSWORD in dev mode.
 */
router.post("/register-admin", async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ error: "register-admin disabled in production" });
    }

    const { secret, name, email, password, roleKey } = req.body as {
      secret?: string;
      name?: string;
      email?: string;
      password?: string;
      roleKey?: string;
    };

    if (!SUPERADMIN_PASSWORD || secret !== SUPERADMIN_PASSWORD) {
      return res.status(401).json({ error: "invalid or missing dev secret" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, password required" });
    }

    if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "user already exists" });

    // Proper role typing
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

    // Create access token
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

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });

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

/**
 * GET /api/auth/me
 * Protected by requireAuth
 */
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
