import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: String,
  relatedId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of article/event/etc
  relatedType: { type: String, required: true }, // 'Article', 'Event', etc
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Comment", commentSchema);
