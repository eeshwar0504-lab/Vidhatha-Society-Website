// backend/src/middleware/auth.ts
import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";
import User from "../models/User";

export type AuthRequest = Request & { user?: any };

// Middleware to require auth: reads Authorization: Bearer <token>
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!header) return res.status(401).json({ error: "Missing Authorization" });

    const payload = verifyJwt(header);
    if (!payload?.userId) return res.status(401).json({ error: "Invalid token" });

    const user = await User.findById(payload.userId).select("-password").lean();
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err:any) {
    console.error("Auth error:", err?.message || err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Permission middleware placeholder
export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Wire in Role -> permissions lookup (Role collection)
    // For now, allow superadmin by roleKey
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      if (user.roleKey === "superadmin") return next();

      // placeholder: check role permissions (load Role and check permissions array)
      // const role = await Role.findOne({ key: user.roleKey });
      // if (role?.permissions?.includes(permission)) return next();

      // For now, deny
      return res.status(403).json({ error: "Forbidden (permission required)" });
    } catch (err) {
      return res.status(403).json({ error: "Forbidden" });
    }
  };
}
