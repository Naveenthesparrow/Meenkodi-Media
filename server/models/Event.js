import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: Date,
  location: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Event", eventSchema);
