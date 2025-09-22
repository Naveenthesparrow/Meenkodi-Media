import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ancientScienceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  field: String,
  scholar: String,
  image: String,
  imageLink: String,
  videoLink: String,
  period: String,
  contentSections: [{
    subtitle: String,
    content: String,
    imageUrl: String,
    imageLink: String,
    videoUrl: String,
    videoTitle: String,
    videoDescription: String,
    id: Number
  }],
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AncientScience", ancientScienceSchema);
