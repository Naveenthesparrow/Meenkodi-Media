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

const festivalSchema = new mongoose.Schema({
  name: { type: bilingual, required: true },
  region: bilingual,
  season: bilingual,
  duration: bilingual,
  rituals: bilingual,
  description: bilingual,
  history: bilingual,
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

export default mongoose.model("Festival", festivalSchema);
