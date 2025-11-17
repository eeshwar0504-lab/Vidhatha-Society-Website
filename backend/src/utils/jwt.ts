// backend/src/utils/jwt.ts
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRY } from "../config";

export type JwtPayload = {
  userId: string;
  roleKey?: string | null;
  iat?: number;
  exp?: number;
};

// ensure secret exists at runtime (helps debugging)
if (!JWT_SECRET) {
  // throw now so developer notices missing env var instead of weird jwt errors later
  throw new Error("Missing JWT_SECRET environment variable");
}

export function signJwt(payload: Partial<JwtPayload>): string {
  // jwt.Secret type
  const secret: jwt.Secret = JWT_SECRET;
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRY ?? "7d",
  };
  // payload accepted as string | object | Buffer
  return jwt.sign(payload as string | object | Buffer, secret, options);
}

export function verifyJwt(token: string): JwtPayload {
  const secret: jwt.Secret = JWT_SECRET;
  return jwt.verify(token, secret) as JwtPayload;
}
