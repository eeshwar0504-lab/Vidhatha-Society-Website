import { Router } from "express";
import Event from "../models/Event";
import { slugify } from "../utils/slugify";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

/**
 * GET /api/events
 * Query: q, page, limit
 */
router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 12);

    const filter: any = {};
    if (q) filter.$or = [
      { title: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
      { location: new RegExp(q, "i") }
    ];

    const total = await Event.countDocuments(filter);
    const items = await Event.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({ ok: true, total, page, limit, items });
  } catch (err) {
    console.error("GET /api/events error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * GET /api/events/:slug
 */
router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const ev = await Event.findOne({ slug }).lean();
    if (!ev) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, event: ev });
  } catch (err) {
    console.error("GET /api/events/:slug error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * POST /api/events  (admin)
 */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, poster } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    const slug = slugify(title);
    const exists = await Event.findOne({ slug });
    if (exists) return res.status(409).json({ error: "slug exists" });

    const e = await Event.create({
      title,
      slug,
      description,
      date: date ? new Date(date) : undefined,
      location,
      poster
    });
    return res.json({ ok: true, event: e });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * PUT /api/events/:id  (admin)
 */
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    if (payload.title) payload.slug = slugify(payload.title);
    const updated = await Event.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, event: updated });
  } catch (err) {
    console.error("PUT /api/events/:id error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * DELETE /api/events/:id  (admin)
 */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await Event.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/events/:id error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

export default router;
