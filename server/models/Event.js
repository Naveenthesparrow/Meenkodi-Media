import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ta: { type: String, required: true }
  },
  description: {
    en: { type: String },
    ta: { type: String }
  },
  date: Date,
  location: {
    en: { type: String },
    ta: { type: String }
  },
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Event", eventSchema);
