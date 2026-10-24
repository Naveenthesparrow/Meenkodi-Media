import mongoose from "mongoose";
import { addSlug } from "../utils/slug.js";

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

// Readable URL (e.g. /explore/temples/meenakshi-amman-temple) instead of the id
addSlug(eventSchema);

export default mongoose.model("Event", eventSchema);
