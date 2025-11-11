import mongoose from "mongoose";

// Reactions stored per comment: one reaction per user, can update emoji type
const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  replies: [replySchema],
  reactions: [reactionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const ClothingSchema = new mongoose.Schema({
  name: { type: bilingual, required: true },
  type: { type: bilingual, required: true },
  region: { type: bilingual },
  materials: { type: bilingual },
  description: { type: bilingual },
  history: { type: bilingual },
  image: { type: String },
  contentSections: [
    {
      subtitle: bilingual,
      content: bilingual,
      imageUrl: String,
      imageLink: String,
      videoUrl: String,
      videoTitle: bilingual,
      videoDescription: bilingual,
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

const Clothing = mongoose.model("Clothing", ClothingSchema);
export default Clothing;
