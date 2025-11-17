import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Role from "../models/Role";
import User from "../models/User";
import { MONGO_URI, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } from "../config";

dotenv.config();

const rolesToCreate = [
  { key: "superadmin", title: "Super Admin", permissions: ["*"], description: "Full access" },
  {
    key: "content_manager",
    title: "Content Manager",
    permissions: ["programs:create", "programs:edit", "programs:delete", "blogs:create", "blogs:edit"],
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
  await mongoose.connect(MONGO_URI);
  console.log("Connected to Mongo for seeding");

  for (const r of rolesToCreate) {
    const exists = await Role.findOne({ key: r.key });
    if (!exists) {
      await Role.create(r);
      console.log("Created role:", r.key);
    } else {
      console.log("Role exists:", r.key);
    }
  }

  const superRole = await Role.findOne({ key: "superadmin" });
  if (!superRole) {
    console.error("superadmin role missing after creation");
    process.exit(1);
  }

  const existingAdmin = await User.findOne({ email: SUPERADMIN_EMAIL });
  if (existingAdmin) {
    console.log("Admin already exists:", SUPERADMIN_EMAIL);
  } else {
    const hashed = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
    const created = await User.create({ name: "Super Admin", email: SUPERADMIN_EMAIL, password: hashed, role: superRole._id });
    console.log("Created Super Admin:", created.email);
  }

  await mongoose.disconnect();
  console.log("Seeding finished");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
