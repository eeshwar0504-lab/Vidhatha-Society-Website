// backend/src/scripts/seedRoles.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Role from "../models/Role";
import User from "../models/User";
import { MONGO_URI, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } from "../config";

dotenv.config();

if (!MONGO_URI) {
  console.error("MONGO_URI is not set. Set it in your .env or backend/.env");
  process.exit(1);
}
if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
  console.error("SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD is not set. Set them in .env");
  process.exit(1);
}

const rolesToCreate = [
  { key: "superadmin", title: "Super Admin", permissions: ["*"], description: "Full access" },
  {
    key: "content_manager",
    title: "Content Manager",
    permissions: [
      "programs:create",
      "programs:edit",
      "programs:delete",
      "blogs:create",
      "blogs:edit"
    ],
    description: "Manage content"
  },
  {
    key: "moderator",
    title: "Moderator",
    permissions: ["volunteers:approve", "contact:view"],
    description: "Moderation tasks"
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI, {});

  console.log("Connected to MongoDB for seeding.");

  // Upsert roles (idempotent)
  for (const r of rolesToCreate) {
    const exists = await Role.findOne({ key: r.key });
    if (!exists) {
      await Role.create(r);
      console.log("Created role:", r.key);
    } else {
      // If role exists, update title/permissions/description to match current config
      await Role.updateOne({ key: r.key }, { $set: { title: r.title, permissions: r.permissions, description: r.description }});
      console.log("Ensured role up-to-date:", r.key);
    }
  }

  const superRole = await Role.findOne({ key: "superadmin" });
  if (!superRole) {
    console.error("superadmin role missing after creation. Aborting.");
    await mongoose.disconnect();
    process.exit(1);
  }

  // Create or ensure admin user
  const existingAdmin = await User.findOne({ email: SUPERADMIN_EMAIL });
  if (existingAdmin) {
    // If admin exists, ensure they have superadmin role
    const needsUpdate = String(existingAdmin.role) !== String(superRole._id);
    if (needsUpdate) {
      existingAdmin.role = superRole._id;
      existingAdmin.roleKey = "superadmin";
      await existingAdmin.save();
      console.log("Updated existing admin to superadmin:", SUPERADMIN_EMAIL);
    } else {
      console.log("Admin already exists with superadmin role:", SUPERADMIN_EMAIL);
    }
  } else {
    const hashed = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
    const created = await User.create({
      name: "Super Admin",
      email: SUPERADMIN_EMAIL,
      password: hashed,
      role: superRole._id,
      roleKey: "superadmin"
    });
    console.log("Created Super Admin:", created.email);
  }

  await mongoose.disconnect();
  console.log("Seeding finished.");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
