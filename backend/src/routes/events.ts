// backend/src/routes/events.ts
import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Event from "../models/Event";
import { slugify } from "../utils/slugify";
import { requireAuth, requirePermission } from "../middleware/auth";

const router = Router();

/* ---------------------- ZOD SCHEMAS ---------------------- */

const listQuerySchema = z.object({
  q: z.string().optional(),
  page: z
    .preprocess((v) => (v === undefined ? 1 : Number(v)), z.number().min(1))
    .optional(),
  limit: z
    .preprocess((v) => (v === undefined ? 12 : Number(v)), z.number().min(1).max(100))
    .optional(),
});

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  date: z.string().datetime({ offset: true }).optional(), // proper ISO
  location: z.string().optional(),
  poster: z.string().optional(),
});

const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  date: z.string().datetime({ offset: true }).optional(),
  location: z.string().optional(),
  poster: z.string().optional(),
});

/* ---------------------- GET LIST ---------------------- */
/**
 * GET /api/events
 * Query: q, page, limit
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);

    const q = parsed.success ? parsed.data.q?.trim() ?? "" : String(req.query.q || "").trim();
    const page = parsed.success ? parsed.data.page ?? 1 : Math.max(1, Number(req.query.page) || 1);
    const limit = parsed.success
      ? parsed.data.limit ?? 12
      : Math.min(100, Number(req.query.limit) || 12);

    const filter: any = {};
    if (q)
      filter.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { location: new RegExp(q, "i") },
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

/* ---------------------- GET SINGLE ---------------------- */
/**
 * GET /api/events/:slugOrId
 * Works with both ObjectId and slug
 */
router.get("/:slugOrId", async (req: Request, res: Response) => {
  try {
    const param = req.params.slugOrId.trim();

    // Try ObjectId first
    if (mongoose.Types.ObjectId.isValid(param)) {
      const byId = await Event.findById(param).lean();
      if (byId) return res.json({ ok: true, event: byId });
    }

    // Fallback to slug
    const bySlug = await Event.findOne({ slug: param }).lean();
    if (!bySlug) return res.status(404).json({ error: "not found" });

    return res.json({ ok: true, event: bySlug });
  } catch (err) {
    console.error("GET /api/events/:slugOrId error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/* ---------------------- CREATE EVENT ---------------------- */
/**
 * POST /api/events
 * Permissions: events:create
 */
router.post(
  "/",
  requireAuth,
  requirePermission("events:create"),
  async (req: Request, res: Response) => {
    try {
      const parsed = createEventSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });

      const { title, description, date, location, poster } = parsed.data;

      const slug = slugify(title);

      const exists = await Event.findOne({ slug });
      if (exists) return res.status(409).json({ error: "slug exists" });

      try {
        const e = await Event.create({
          title,
          slug,
          description,
          date: date ? new Date(date) : undefined,
          location,
          poster,
        });

        return res.json({ ok: true, event: e });
      } catch (err: any) {
        if (err?.code === 11000) return res.status(409).json({ error: "slug conflict" });
        throw err;
      }
    } catch (err) {
      console.error("POST /api/events error:", err);
      return res.status(500).json({ error: "internal" });
    }
  }
);

/* ---------------------- UPDATE EVENT ---------------------- */
/**
 * PUT /api/events/:id
 * Permissions: events:edit
 */
router.put(
  "/:id",
  requireAuth,
  requirePermission("events:edit"),
  async (req: Request, res: Response) => {
    try {
      const parsed = updateEventSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });

      const id = req.params.id;

      const payload: any = parsed.data;
      if (payload.title) payload.slug = slugify(payload.title);

      const updated = await Event.findByIdAndUpdate(id, payload, { new: true });
      if (!updated) return res.status(404).json({ error: "not found" });

      return res.json({ ok: true, event: updated });
    } catch (err) {
      console.error("PUT /api/events/:id error:", err);
      return res.status(500).json({ error: "internal" });
    }
  }
);

/* ---------------------- DELETE EVENT ---------------------- */
/**
 * DELETE /api/events/:id
 * Permissions: events:delete
 */
router.delete(
  "/:id",
  requireAuth,
  requirePermission("events:delete"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await Event.findByIdAndDelete(id);
      return res.json({ ok: true });
    } catch (err) {
      console.error("DELETE /api/events/:id error:", err);
      return res.status(500).json({ error: "internal" });
    }
  }
);

export default router;
