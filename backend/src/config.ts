import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Zaheer_8018:Zaheer248@cluster0.bmujoia.mongodb.net/?appName=Cluster0";
export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
export const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
export const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "admin@example.com";
export const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "change_me_secure";
