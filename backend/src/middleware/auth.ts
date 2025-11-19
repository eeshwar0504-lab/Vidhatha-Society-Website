// backend/src/middleware/auth.ts
import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import Role from "../models/Role";
import { verifyJwt } from "../utils/jwt";

export type AuthRequest = Request & { user?: any };

/**
 * requireAuth - validates Authorization: Bearer <token>
 * - verifies JWT (catches expired/invalid)
 * - expects payload.userId
 * - loads user by id, selects -password, populates role
 * - attaches user to req.user and ensures roleKey convenience field
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = (req.headers.authorization || "").trim();
    if (!header) return res.status(401).json({ error: "Missing Authorization header" });

    const token = header.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Missing token" });

    // verifyJwt may throw; catch and return 401
    let payload: any;
    try {
      payload = verifyJwt(token);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (!payload?.userId) return res.status(401).json({ error: "Invalid token payload" });

    // Load user (exclude password) and populate role for permission checks
    const user = await User.findById(payload.userId).select("-password").populate("role").lean();
    if (!user) return res.status(401).json({ error: "User not found" });

    // Ensure developer convenience: use roleKey from DB or token or populated role
    if (!user.roleKey && payload.roleKey) (user as any).roleKey = payload.roleKey;
    if (!user.roleKey && (user as any).role && (user as any).role.key) (user as any).roleKey = (user as any).role.key;

    req.user = user;
    return next();
  } catch (err: any) {
    console.error("requireAuth error:", err?.message || err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/**
 * requirePermission(permission)
 * - fast-allow if user.roleKey === "superadmin"
 * - if user.role populated and has permissions[], evaluate it
 * - otherwise find Role by roleKey or role id to check permissions
 * - supports wildcard "*" in role.permissions
 */
export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      // Fast allow superadmin by roleKey
      if (user.roleKey === "superadmin") return next();

      // If role is populated (object with permissions array)
      const roleObj = user.role;
      if (roleObj && Array.isArray((roleObj as any).permissions)) {
        const perms = (roleObj as any).permissions as string[];
        if (perms.includes("*") || perms.includes(permission)) return next();
        return res.status(403).json({ error: "Forbidden (permission required)" });
      }

      // If user has roleKey (string), find Role document
      if (user.roleKey) {
        const roleDoc = await Role.findOne({ key: user.roleKey }).lean();
        if (!roleDoc) return res.status(403).json({ error: "Forbidden" });
        const perms = roleDoc.permissions || [];
        if (perms.includes("*") || perms.includes(permission)) return next();
        return res.status(403).json({ error: "Forbidden (permission required)" });
      }

      // If user.role is an ObjectId but not populated
      if (user.role) {
        try {
          const roleDoc = await Role.findById(user.role).lean();
          if (roleDoc) {
            const perms = roleDoc.permissions || [];
            if (perms.includes("*") || perms.includes(permission)) return next();
            return res.status(403).json({ error: "Forbidden (permission required)" });
          }
        } catch (err) {
          // ignore and fallthrough to forbidden
        }
      }

      return res.status(403).json({ error: "Forbidden (permission required)" });
    } catch (err) {
      console.error("requirePermission error:", err);
      return res.status(403).json({ error: "Forbidden" });
    }
  };
}

/**
 * requireAdmin - convenience: allow only superadmin
 * - checks user.roleKey OR populated user.role.key
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "unauthorized" });

  if (user.roleKey && user.roleKey === "superadmin") return next();

  if (user.role && typeof user.role === "object" && (user.role as any).key === "superadmin") {
    return next();
  }

  return res.status(403).json({ error: "forbidden - admin only" });
}
