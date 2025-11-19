// backend/src/routes/roles.ts
import { Router, Request, Response } from "express";
import Role from "../models/Role";
import { requireAuth, requirePermission, requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * GET /api/roles
 * Public read-only listing of roles + permissions.
 * You may change to requireAuth + requireAdmin if you want only admins to view.
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const roles = await Role.find().lean();
    return res.json({ ok: true, roles });
  } catch (err) {
    console.error("GET /api/roles error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * GET /api/roles/:key
 * Returns role by key (e.g. "superadmin")
 */
router.get("/:key", async (req: Request, res: Response) => {
  try {
    const key = String(req.params.key || "").trim();
    if (!key) return res.status(400).json({ error: "role key required" });
    const role = await Role.findOne({ key }).lean();
    if (!role) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, role });
  } catch (err) {
    console.error("GET /api/roles/:key error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

export default router;

