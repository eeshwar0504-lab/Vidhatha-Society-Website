import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Role from "../models/Role";
import { signJwt, verifyJwt } from "../utils/jwt";
import { isEmail } from "../utils/validators";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });

    const user = await User.findOne({ email }).populate("role");
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const roleKey = (user.role as any)?.key ?? null;
    const token = signJwt({ userId: user._id.toString(), roleKey });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: roleKey }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "missing token" });
    const token = auth.split(" ")[1];
    const payload = verifyJwt(token);
    const user = await User.findById(payload.userId).select("-password").populate("role");
    if (!user) return res.status(404).json({ error: "user not found" });
    return res.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(401).json({ error: "invalid token" });
  }
});

export default router;
