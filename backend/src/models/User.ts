import mongoose, { Schema, Document } from "mongoose";
import { IRole } from "./Role";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  // role holds ObjectId reference to Role OR populated IRole
  role?: mongoose.Types.ObjectId | IRole;
  // convenience string key (e.g. "superadmin") — optional
  roleKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role" },
    roleKey: { type: String }, // optional stored role key for quick checks
  },
  { timestamps: true }
);

// Safe export to prevent model overwrite in dev / hot reloads
const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
export default User;
