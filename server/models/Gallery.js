import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Gallery", gallerySchema);
