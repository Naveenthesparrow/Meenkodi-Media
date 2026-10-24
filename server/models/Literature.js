import mongoose from "mongoose";
import { addSlug } from "../utils/slug.js";

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

const literatureSchema = new mongoose.Schema({
  title: { type: bilingual, required: true },
  author: bilingual,
  period: bilingual,
  genre: bilingual,
  language: bilingual,
  summary: bilingual,
  description: bilingual,
  content: bilingual,
  significance: bilingual,
  image: String,
  media: [String],
  contentSections: [{
    subtitle: bilingual,
    content: bilingual,
    imageUrl: String,
    imageLink: String,
    videoUrl: String,
    videoTitle: String,
    videoDescription: String
  }],
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

// Readable URL (e.g. /explore/temples/meenakshi-amman-temple) instead of the id
addSlug(literatureSchema);

export default mongoose.model("Literature", literatureSchema);
