// backend/src/routes/auth.ts
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Role from "../models/Role";
import { signJwt } from "../utils/jwt";
import { isEmail } from "../utils/validators";
import { SUPERADMIN_PASSWORD } from "../config";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * POST /api/auth/register-admin
 * Dev-only: registers an admin (superadmin by default).
 * Guard: only enabled when NODE_ENV !== "production" and body.secret === SUPERADMIN_PASSWORD
 * Body: { secret, name, email, password, roleKey? }
 */
router.post("/register-admin", async (req: Request, res: Response) => {
  try {
    // Prevent use in production
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

    // dev guard: require SUPERADMIN_PASSWORD match
    if (!SUPERADMIN_PASSWORD || secret !== SUPERADMIN_PASSWORD) {
      return res.status(401).json({ error: "missing or invalid dev secret" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }
    if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "user already exists" });

    // ensure role exists (if provided)
    let roleRef: any = null;
    let resolvedRoleKey = "superadmin";
    if (roleKey) {
      const roleDoc = await Role.findOne({ key: roleKey });
      if (!roleDoc) return res.status(400).json({ error: `role '${roleKey}' not found` });
      roleRef = roleDoc._id;
      resolvedRoleKey = roleDoc.key;
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role: roleRef ?? undefined,
      roleKey: resolvedRoleKey,
    });

    // respond without password
    return res.json({
      ok: true,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, roleKey: newUser.roleKey },
    });
  } catch (err: any) {
    console.error("register-admin error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { token, user }
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });

    // populate role (if stored as reference)
    const user = await User.findOne({ email }).populate("role");
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    // prefer populated role.key, fallback to stored roleKey, else null
    const roleKey = (user.role as any)?.key ?? user.roleKey ?? null;
    const token = signJwt({ userId: user._id.toString(), roleKey });

    return res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: roleKey },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Uses requireAuth middleware to populate req.user
 */
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    // requireAuth should attach user (without password) to req.user
    const anyReq = req as any;
    const user = anyReq.user;
    if (!user) return res.status(401).json({ error: "unauthorized" });
    return res.json({ ok: true, user });
  } catch (err: any) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

export default router;
