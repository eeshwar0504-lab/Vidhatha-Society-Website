import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  key: string;
  title: string;
  permissions: string[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    permissions: { type: [String], default: [] },
    description: { type: String },
  },
  { timestamps: true }
);

// Use existing model if available (avoids OverwriteModelError in dev)
const Role = (mongoose.models.Role as mongoose.Model<IRole>) || mongoose.model<IRole>("Role", RoleSchema);
export default Role;
