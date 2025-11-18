import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description?: string;
  date?: Date;
  location?: string;
  poster?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  date: { type: Date },
  location: { type: String },
  poster: { type: String },
}, { timestamps: true });

export default mongoose.model<IEvent>("Event", EventSchema);
