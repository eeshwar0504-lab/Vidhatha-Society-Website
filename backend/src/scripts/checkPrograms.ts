import mongoose from "mongoose";
import dotenv from "dotenv";
import Program from "../models/Program";
import { MONGO_URI } from "../config";

dotenv.config();

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected.");
  const all = await Program.find({}).lean();
  console.log("Programs:", all.length);
  all.forEach(p => console.log(p.title, "|", p.slug, "| _id:", p._id.toString()));
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
