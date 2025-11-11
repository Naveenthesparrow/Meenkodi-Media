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

const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const ancientScienceSchema = new mongoose.Schema({
  name: { type: bilingual, required: true },
  description: { type: bilingual, required: true },
  field: bilingual,
  scholar: bilingual,
  image: String,
  imageLink: String,
  videoLink: String,
  period: bilingual,
  contentSections: [{
    subtitle: bilingual,
    content: bilingual,
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
