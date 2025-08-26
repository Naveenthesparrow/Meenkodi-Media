import mongoose from "mongoose";

const danceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: String,
  style: String,
  origin: String,
  costume: String,
  description: String,
  history: String,
  significance: String,
  image: String,
  media: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Dance", danceSchema);
