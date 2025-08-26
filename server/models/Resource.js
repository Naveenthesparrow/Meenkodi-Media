import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  author: String,
  image: String,
  downloadLink: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Resource", resourceSchema);
