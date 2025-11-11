import mongoose from "mongoose";

const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const gallerySchema = new mongoose.Schema({
  title: { type: bilingual, required: true },
  description: bilingual,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Gallery", gallerySchema);
