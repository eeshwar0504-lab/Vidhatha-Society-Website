// backend/src/routes/programs.ts
import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Program from "../models/Program";
import { slugify } from "../utils/slugify";
import { requireAuth, requirePermission } from "../middleware/auth";

const router = Router();

/**
 * Zod schemas (basic validation)
 */
const listQuerySchema = z.object({
  q: z.string().optional(),
  page: z.preprocess((val) => (val === undefined ? 1 : Number(val)), z.number().min(1)).optional(),
  limit: z.preprocess((val) => (val === undefined ? 12 : Number(val)), z.number().min(1).max(100)).optional(),
  category: z.string().optional(),
});

const createProgramSchema = z.object({
  title: z.string().min(3, "title must be at least 3 characters"),
  // we allow `short` at schema level; we'll accept incoming `shortDescription`/typos in handler
  short: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
  donation_target: z.number().optional(),
  // allow imageUrl (client sometimes sends this)
  imageUrl: z.string().optional(),
});

const updateProgramSchema = z.object({
  title: z.string().min(3).optional(),
  short: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
  donation_target: z.number().optional(),
  imageUrl: z.string().optional(),
});

/**
 * Helper: normalize program document (plain object) for frontend consumption
 * - ensures images is an array (maybe empty)
 * - sets imageUrl to first image if available or to any provided imageUrl field
 */
function normalizeProgramObj(raw: any) {
  if (!raw || typeof raw !== "object") return raw;
  const obj = { ...raw };

  // Ensure images array
  const images: string[] =
    Array.isArray(obj.images) && obj.images.length
      ? obj.images.filter(Boolean).map((s: any) => String(s))
      : [];

  // If the doc contains imageUrl (single) use it as fallback into images
  if ((!images || images.length === 0) && obj.imageUrl) {
    images.push(String(obj.imageUrl));
  }

  // Provide a convenient top-level imageUrl for front-end (first image or null)
  const imageUrl = images.length > 0 ? images[0] : null;

  obj.images = images;
  obj.imageUrl = imageUrl;

  return obj;
}

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
    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { short: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    }
    if (category) filter.category = category;

    const total = await Program.countDocuments(filter);
    // use .lean() so we get plain objects (no TS Document issues)
    const items = await Program.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Normalize each item to ensure images/imageUrl shape
    const normalized = Array.isArray(items) ? items.map((it: any) => normalizeProgramObj(it)) : [];

    return res.json({ ok: true, total, page, limit, items: normalized, programs: normalized });
  } catch (err) {
    console.error("GET /api/programs error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/**
 * GET /api/programs/:slugOrId
 *
 * Behaviour:
 * - If param looks like a Mongo ObjectId -> try findById (lean)
 * - else fallback to slug lookup (lean)
 */
router.get("/:slugOrId", async (req, res) => {
  try {
    const param = String(req.params.slugOrId || "").trim();

    if (mongoose.Types.ObjectId.isValid(param)) {
      const byId = await Program.findById(param).lean();
      if (byId) {
        return res.json({ ok: true, program: normalizeProgramObj(byId) });
      }
      // if valid ObjectId but not found, continue to try slug (fallback)
    }

    const program = await Program.findOne({ slug: param }).lean();
    if (!program) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true, program: normalizeProgramObj(program) });
  } catch (err) {
    console.error("GET /api/programs/:slugOrId error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

/* Admin endpoints using requirePermission */

/**
 * POST /api/programs
 * Permission required: programs:create
 *
 * Notes:
 * - Accepts both `short` and `shortDescription` (and common typo `shortDescsription`) from clients
 * - Accepts `imageUrl` (single) or `images` array
 */
router.post("/", requireAuth, requirePermission("programs:create"), async (req, res) => {
  try {
    // Basic validation via zod; we still will read fallback fields from raw body if needed
    const parsed = createProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });
    }

    // Allow frontend variants: prefer parsed.short, otherwise fallback to common alternative keys
    const rawBody: any = req.body || {};
    const shortFromBody = parsed.data.short ?? rawBody.shortDescription ?? rawBody.shortDescsription ?? null;
    const { title, description, category, images, donation_target, imageUrl } = parsed.data;

    const slug = slugify(title);
    const exists = await Program.findOne({ slug }).lean();
    if (exists) return res.status(409).json({ error: "slug exists" });

    try {
      // Build DB payload: prefer images array; if single imageUrl provided use it
      const dbImages = Array.isArray(images) && images.length ? images : imageUrl ? [imageUrl] : [];

      const p = await Program.create({
        title,
        slug,
        short: shortFromBody ?? undefined,
        description,
        category,
        images: dbImages,
        donation_target,
      });

      // convert to plain object and normalize before returning
      const out = normalizeProgramObj((p as any).toObject ? (p as any).toObject() : p);
      return res.json({ ok: true, program: out });
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
 *
 * Accepts either `short` or `shortDescription` from clients (we normalize)
 */
router.put("/:id", requireAuth, requirePermission("programs:edit"), async (req, res) => {
  try {
    const id = req.params.id;

    // parse with zod (will coerce fields present in schema)
    const parsed = updateProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation failed", details: parsed.error.flatten() });
    }

    // Use raw body for fallback keys (shortDescription / typo)
    const rawBody: any = req.body || {};
    const shortFromBody = parsed.data.short ?? rawBody.shortDescription ?? rawBody.shortDescsription ?? undefined;

    // Build payload for DB update
    const payload: any = { ...parsed.data };
    if (shortFromBody !== undefined) payload.short = shortFromBody;

    if (payload.title) payload.slug = slugify(payload.title);

    // If client sent imageUrl (single), convert to images array for DB
    if (rawBody.imageUrl && (!payload.images || payload.images.length === 0)) {
      payload.images = [rawBody.imageUrl];
    }

    const updatedDoc = await Program.findByIdAndUpdate(id, payload, { new: true });
    if (!updatedDoc) return res.status(404).json({ error: "not found" });

    // convert to plain object to avoid TS Document property errors
    const updatedObj = (updatedDoc as any).toObject ? (updatedDoc as any).toObject() : updatedDoc;
    return res.json({ ok: true, program: normalizeProgramObj(updatedObj) });
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
