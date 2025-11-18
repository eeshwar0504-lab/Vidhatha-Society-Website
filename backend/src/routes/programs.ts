// backend/src/routes/programs.ts
import { Router } from "express";
import mongoose from "mongoose";
import Program from "../models/Program";
import { slugify } from "../utils/slugify";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireAuth } from "../middleware/auth"; // ensure this exists from Day 1

const router = Router();

/**
 * GET /api/programs
 * Query: q, page, limit, category
 * NOTE: returns `items` and also `programs` (same value) for frontend convenience.
 */
router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 12);
    const category = req.query.category ? String(req.query.category) : undefined;

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

    // Provide both `items` and `programs` — frontend can use either
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
 *
 * This makes GET /api/programs/<id> and GET /api/programs/<slug> both work.
 */
router.get("/:slugOrId", async (req, res) => {
  try {
    const param = String(req.params.slugOrId || "").trim();

    // If param is a valid ObjectId, try findById first
    if (mongoose.Types.ObjectId.isValid(param)) {
      const byId = await Program.findById(param).lean();
      if (byId) {
        return res.json({ ok: true, program: byId });
      }
      // if valid ObjectId but not found, continue to try slug (fallback)
    }

    // fallback: treat as slug
    const program = await Program.findOne({ slug: param }).lean();
    if (!program) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, program });
  } catch (err) {
    console.error("GET /api/programs/:slugOrId error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/* Admin endpoints (unchanged) */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, short, description, category, images, donation_target } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    const slug = slugify(title);
    const exists = await Program.findOne({ slug });
    if (exists) return res.status(409).json({ error: "slug exists" });

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
  } catch (err) {
    console.error("POST /api/programs error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    if (payload.title) payload.slug = slugify(payload.title);
    const updated = await Program.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, program: updated });
  } catch (err) {
    console.error("PUT /api/programs/:id error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
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