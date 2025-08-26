import mongoose from "mongoose";

const festivalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: String,
  season: String,
  duration: String,
  rituals: String,
  description: String,
  history: String,
  significance: String,
  image: String,
  media: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Festival", festivalSchema);
