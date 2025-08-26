import mongoose from "mongoose";

const kingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dynasty: String,
  period: String,
  capital: String,
  achievements: String,
  description: String,
  content: String,
  image: String,
  media: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("King", kingSchema);
