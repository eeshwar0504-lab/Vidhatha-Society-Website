// backend/src/scripts/createSuperAdmins.ts
/**
 * Create 4 super-admin users in the DB.
 * Usage (from project root):
 *   cd backend
 *   npx ts-node --files src/scripts/createSuperAdmins.ts
 *
 * NOTE:
 * - This script assumes your backend has mongoose models at:
 *     backend/src/models/User
 *     backend/src/models/Role
 *   Adjust the import paths if your project differs.
 * - It reads MONGO_URI from process.env (use ../.env or set env before running).
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// import models (adjust paths if necessary)
import User from "../models/User";
import Role from "../models/Role";

// If your model exports are not typed, cast them to any so this script compiles.
const UserModel = (User as any) || undefined;
const RoleModel = (Role as any) || undefined;

async function main() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI missing in environment");
    }

    await mongoose.connect(mongoUri, {
      // these options keep compatibility across mongoose versions
      // @ts-ignore
      useNewUrlParser: true,
      // @ts-ignore
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Find or create superadmin role
    let superadminRoleDoc: any = null;
    if (!RoleModel) {
      throw new Error("Role model not found - check import path");
    }

    // Look for common name fields (key, roleKey)
    superadminRoleDoc = await RoleModel.findOne({ key: "superadmin" }).lean() || await RoleModel.findOne({ roleKey: "superadmin" }).lean();

    if (!superadminRoleDoc) {
      console.log("⚠️ Superadmin role not found. Creating a new 'superadmin' role...");
      const created = await RoleModel.create({
        title: "Super Admin",
        key: "superadmin",
        permissions: ["*"], // adjust permissions structure to match your Role schema
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      superadminRoleDoc = created;
    }

    const roleId = superadminRoleDoc._id;
    console.log("Superadmin role id:", roleId.toString());

    // Define the 4 users to create
    const admins = [
         { name: "Admin One",   email: "keyura@vidhatha.org", password: "lucky_12" },
         { name: "Admin Two",   email: "Eeshwar@vidhatha.org", password: "eeshwar_04" },
         { name: "Admin Three", email: "zaheer@vidhatha.org", password: "zaheer_248" },
         { name: "Admin Four", email: "srilatha@vidhatha.org", password: "srilatha_11" },

    ];

    if (!UserModel) {
      throw new Error("User model not found - check import path");
    }

    for (const a of admins) {
      const exists = await UserModel.findOne({ email: a.email });
      if (exists) {
        console.log(`⚠️ User already exists: ${a.email} - skipping`);
        continue;
      }

      const hashed = await bcrypt.hash(a.password, 10);

      const created = await UserModel.create({
        name: a.name,
        email: a.email,
        password: hashed,
        role: roleId,
        roleKey: "superadmin", // match field used in your schema
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Created super admin: ${a.email} (id: ${created._id})`);
    }

    console.log("🎉 All done.");
  } catch (err) {
    console.error("❌ Error creating super admins:", err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {}
  }
}

main();
