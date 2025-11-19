// backend/src/routes/programs.ts
import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Program from "../models/Program";
import { slugify } from "../utils/slugify";
import { requireAuth, requirePermission } from "../middleware/auth";

const router = Router();

/**
 * Zod schemas
 */
const listQuerySchema = z.object({
  q: z.string().optional(),
  page: z.preprocess((val) => (val === undefined ? 1 : Number(val)), z.number().min(1)).optional(),
  limit: z.preprocess((val) => (val === undefined ? 12 : Number(val)), z.number().min(1).max(100)).optional(),
  category: z.string().optional(),
});

const createProgramSchema = z.object({
  title: z.string().min(3, "title must be at least 3 characters"),
  short: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
  donation_target: z.number().optional(),
});

const updateProgramSchema = z.object({
  title: z.string().min(3).optional(),
  short: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
  donation_target: z.number().optional(),
});

/**
 * GET /api/programs
 * Query: q, page, limit, category
 * NOTE: returns `items` and also `programs` (same value) for frontend convenience.
 */
router.get("/", async (req, res) => {
  try {
    // validate query params (safeParse will coerce page/limit)
    const parseRes = listQuerySchema.safeParse(req.query);
    const q = parseRes.success ? (parseRes.data.q || "").trim() : String(req.query.q || "").trim();
    const page = parseRes.success ? Number(parseRes.data.page || 1) : Math.max(1, Number(req.query.page) || 1);
    const limit = parseRes.success ? Number(parseRes.data.limit || 12) : Math.min(100, Number(req.query.limit) || 12);
    const category = parseRes.success ? parseRes.data.category : (req.query.category ? String(req.query.category) : undefined);

    const filter: any = {};
    if (q) filter.$or = [
      { title: new RegExp(q, "i") },
      { short: new RegExp(q, "i") },
      { description: new RegExp(q, "i") }
    ];
    if (category) filter.category = category;

    const total = await Program.countDocuments(filter);
    const items = await Program.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({ ok: true, total, page, limit, items, programs: items });
  } catch (err) {
    console.error("GET /api/programs error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * GET /api/programs/:slugOrId
 *
 * Behaviour:
 * - If param looks like a Mongo ObjectId -> try findById
 * - else fallback to slug lookup (existing behaviour)
 */
router.get("/:slugOrId", async (req, res) => {
  try {
    const param = String(req.params.slugOrId || "").trim();

    if (mongoose.Types.ObjectId.isValid(param)) {
      const byId = await Program.findById(param).lean();
      if (byId) {
        return res.json({ ok: true, program: byId });
      }
      // if valid ObjectId but not found, continue to try slug (fallback)
    }

    const program = await Program.findOne({ slug: param }).lean();
    if (!program) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, program });
  } catch (err) {
    console.error("GET /api/programs/:slugOrId error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/* Admin endpoints using requirePermission */

/**
 * POST /api/programs
 * Permission required: programs:create
 */
router.post("/", requireAuth, requirePermission("programs:create"), async (req, res) => {
  try {
    const parsed = createProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });
    }

    const { title, short, description, category, images, donation_target } = parsed.data;

    const slug = slugify(title);
    const exists = await Program.findOne({ slug });
    if (exists) return res.status(409).json({ error: "slug exists" });

    try {
      const p = await Program.create({
        title,
        slug,
        short,
        description,
        category,
        images: images || [],
        donation_target
      });
      return res.json({ ok: true, program: p });
    } catch (err: any) {
      // handle duplicate key from a race condition (two requests created same slug)
      if (err?.code === 11000) {
        return res.status(409).json({ error: "slug conflict" });
      }
      throw err;
    }
  } catch (err) {
    console.error("POST /api/programs error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * PUT /api/programs/:id
 * Permission required: programs:edit
 */
router.put("/:id", requireAuth, requirePermission("programs:edit"), async (req, res) => {
  try {
    const id = req.params.id;
    const parsed = updateProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });
    }
    const payload = parsed.data as any;

    if (payload.title) payload.slug = slugify(payload.title);

    const updated = await Program.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, program: updated });
  } catch (err) {
    console.error("PUT /api/programs/:id error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * DELETE /api/programs/:id
 * Permission required: programs:delete
 */
router.delete("/:id", requireAuth, requirePermission("programs:delete"), async (req, res) => {
  try {
    const id = req.params.id;
    await Program.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/programs/:id error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

export default router;
