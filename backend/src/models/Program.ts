import mongoose, { Schema, Document } from "mongoose";

export interface IProgram extends Document {
  title: string;
  slug: string;
  short?: string;
  description?: string;
  category?: string;
  images: string[];
  donation_target?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProgramSchema = new Schema<IProgram>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  short: { type: String },
  description: { type: String },
  category: { type: String },
  images: { type: [String], default: [] },
  donation_target: { type: Number },
}, { timestamps: true });

export default mongoose.model<IProgram>("Program", ProgramSchema);
