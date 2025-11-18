import { Router } from "express";
import Program from "../models/Program";
import { slugify } from "../utils/slugify";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireAuth } from "../middleware/auth"; // ensure this exists from Day 1

const router = Router();

/**
 * GET /api/programs
 * Query: q, page, limit, category
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

    return res.json({ ok: true, total, page, limit, items });
  } catch (err) {
    console.error("GET /api/programs error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * GET /api/programs/:slug
 */
router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const program = await Program.findOne({ slug }).lean();
    if (!program) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, program });
  } catch (err) {
    console.error("GET /api/programs/:slug error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * POST /api/programs  (admin)
 */
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

/**
 * PUT /api/programs/:id  (admin)
 */
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

/**
 * DELETE /api/programs/:id  (admin)
 */
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
