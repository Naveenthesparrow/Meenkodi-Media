import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  author: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Article", articleSchema);
