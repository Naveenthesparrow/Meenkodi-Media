import mongoose from "mongoose";

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
  replies: [
    {
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
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const danceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  style: String,
  origin: String,
  period: String,
  achievements: String,
  description: String,
  content: String,
  image: String,
  media: [String],
  contentSections: [
    {
      subtitle: String,
      content: String,
      imageUrl: String,
      imageLink: String,
      videoUrl: String,
      videoTitle: String,
      videoDescription: String,
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

export default mongoose.model("Dance", danceSchema);
