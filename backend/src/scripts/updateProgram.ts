import mongoose from "mongoose";
import dotenv from "dotenv";
import Program from "../models/Program";
import { MONGO_URI } from "../config";

dotenv.config();

async function run() {
  await mongoose.connect(MONGO_URI);
  const slug = "free-food-distribution";
  const updated = await Program.findOneAndUpdate(
    { slug },
    { $set: { short: "Providing healthy meals to underprivileged families.", donation_target: 60000 } },
    { new: true }
  ).lean();
  console.log("Updated:", updated);
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
