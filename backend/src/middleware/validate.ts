// backend/src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * validate(schema) - express middleware wrapper for zod schemas
 * Usage: router.post("/", validate(schema), handler)
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      // Flatten zod errors
      const issues = (result.error as ZodError).format();
      return res.status(400).json({ error: "validation failed", details: issues });
    }
    // attach parsed result to req (optional)
    // we keep using req.body in handlers, but validated data is available in result.data
    next();
  };
}
