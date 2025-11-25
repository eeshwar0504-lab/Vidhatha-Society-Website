// backend/src/testMongo.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // will load backend/.env (or root .env if you prefer)

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vidhatha-dev";

async function test() {
  console.log("Connecting to:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB ✅");

  const TestSchema = new mongoose.Schema({ message: String }, { timestamps: true });
  const Test = mongoose.model("Test", TestSchema);

  const doc = await Test.create({ message: `Test at ${new Date().toISOString()}` });
  console.log("Inserted doc:", doc);

  const all = await Test.find().limit(5);
  console.log("Found docs (up to 5):", all);

  await mongoose.disconnect();
  console.log("Disconnected, done.");
  process.exit(0);
}

test().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
