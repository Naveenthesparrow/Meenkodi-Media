import mongoose from "mongoose";

const literatureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  period: String,
  genre: String,
  language: String,
  summary: String,
  description: String,
  content: String,
  significance: String,
  image: String,
  media: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Literature", literatureSchema);
