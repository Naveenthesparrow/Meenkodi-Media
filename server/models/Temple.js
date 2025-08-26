import mongoose from "mongoose";

const templeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  deity: String,
  period: String,
  dynasty: String,
  builder: String,
  architecture: String,
  description: String,
  significance: String,
  image: String,
  imageUrl: String,
  imageLink: String,
  videoUrl: String,
  videoLink: String,
  media: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Temple", templeSchema);
