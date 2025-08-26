import mongoose from "mongoose";

const ancientScienceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  imageLink: String,
  videoLink: String,
  period: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AncientScience", ancientScienceSchema);
