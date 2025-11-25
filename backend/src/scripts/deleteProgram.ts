import mongoose from "mongoose";
import dotenv from "dotenv";
import Program from "../models/Program";
import { MONGO_URI } from "../config";

dotenv.config();

async function run() {
  await mongoose.connect(MONGO_URI);
  const slug = "sanitary-napkin-distribution";

  // check first
  const doc = await Program.findOne({ slug }).lean();
  if (!doc) {
    console.log("Not found:", slug);
    await mongoose.disconnect();
    return;
  }
  console.log("Found:", doc.title, doc._id);

  // delete
  const res = await Program.deleteOne({ slug });
  console.log("DeletedCount:", res.deletedCount);

  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
