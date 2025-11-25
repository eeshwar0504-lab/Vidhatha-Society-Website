// backend/src/routes/rolesAdmin.ts
import { Router, Request, Response } from "express";
import { z } from "zod";
import Role from "../models/Role";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const roleCreateSchema = z.object({
  key: z.string().min(2),
  title: z.string().min(2),
  permissions: z.array(z.string()).optional(),
  description: z.string().optional(),
});

const roleUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  permissions: z.array(z.string()).optional(),
  description: z.string().optional(),
});

/**
 * GET /api/admin/roles
 * Admin-only list
 */
router.get("/", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const roles = await Role.find().lean();
    return res.json({ ok: true, roles });
  } catch (err) {
    console.error("GET /api/admin/roles error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * GET /api/admin/roles/:key
 * Admin-only get by key
 */
router.get("/:key", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const key = String(req.params.key || "").trim();
    if (!key) return res.status(400).json({ error: "role key required" });

    const role = await Role.findOne({ key }).lean();
    if (!role) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, role });
  } catch (err) {
    console.error("GET /api/admin/roles/:key error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * POST /api/admin/roles
 * Create role (admin-only)
 */
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = roleCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });

    const { key, title, permissions = [], description } = parsed.data;

    const exists = await Role.findOne({ key });
    if (exists) return res.status(409).json({ error: "role key exists" });

    const created = await Role.create({ key, title, permissions, description });
    return res.json({ ok: true, role: created });
  } catch (err) {
    console.error("POST /api/admin/roles error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * PUT /api/admin/roles/:id
 * Update role (admin-only)
 */
router.put("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = roleUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });

    const updated = await Role.findByIdAndUpdate(req.params.id, parsed.data as any, { new: true });
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, role: updated });
  } catch (err) {
    console.error("PUT /api/admin/roles/:id error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * DELETE /api/admin/roles/:id
 * Delete role (admin-only)
 */
router.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await Role.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/roles/:id error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

export default router;
