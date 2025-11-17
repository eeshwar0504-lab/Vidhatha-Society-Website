import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  key: string;
  title: string;
  permissions: string[];
  description?: string;
}

const RoleSchema = new Schema<IRole>({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  permissions: { type: [String], default: [] },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model<IRole>("Role", RoleSchema);
