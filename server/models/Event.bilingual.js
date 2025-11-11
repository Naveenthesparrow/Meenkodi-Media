import mongoose from "mongoose";

// Bilingual field schema helper
const bilingualString = {
  en: { type: String, default: '' },
  ta: { type: String, default: '' }
};

const eventSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ta: { type: String, required: true }
  },
  description: {
    en: { type: String },
    ta: { type: String }
  },
  location: {
    en: { type: String },
    ta: { type: String }
  },
  date: Date,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Event", eventSchema);
