import { Request, Response, NextFunction } from "express";

/**
 * requireAdmin - simple check that req.user is set and roleKey === 'superadmin'
 * Adjust if your req.user uses a different shape.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const anyReq = req as any;
  const user = anyReq.user;
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // If user.roleKey is set (JWT included), check it. If role object present, check accordingly.
  if (user.roleKey && user.roleKey === "superadmin") {
    return next();
  }

  // if role object attached (e.g., via populate)
  if (user.role && typeof user.role === "object" && (user.role as any).key === "superadmin") {
    return next();
  }

  return res.status(403).json({ error: "forbidden - admin only" });
}
