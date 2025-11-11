import mongoose from "mongoose";

const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const articleSchema = new mongoose.Schema({
  title: { type: bilingual, required: true },
  content: bilingual,
  author: bilingual,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Article", articleSchema);
