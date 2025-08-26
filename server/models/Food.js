import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: String,
  type: String,
  ingredients: String,
  recipe: String,
  description: String,
  occasion: String,
  significance: String,
  image: String,
  media: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Food", foodSchema);
