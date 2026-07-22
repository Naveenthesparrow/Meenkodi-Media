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

const dynastySchema = new mongoose.Schema({
  name: { type: bilingual, required: true },
  slug: { type: String, required: true, unique: true }, // pandiya, chera, chola, pallava, ltte
  tagline: bilingual,
  period: bilingual,
  capital: bilingual,
  region: bilingual,
  language: bilingual,
  religion: bilingual,
  territory: bilingual,
  rulers: bilingual, // Famous rulers
  achievements: bilingual,
  summary: bilingual,
  description: bilingual,
  content: bilingual,
  banner: String,
  mapEmbed: String,
  mediaText: bilingual,
  flag: String, // Dynasty flag/emblem
  image: String, // Main image
  media: [String], // Additional images/videos
  contentSections: [{
    subtitle: bilingual,
    content: bilingual,
    imageUrl: String,
    imageLink: String,
    videoUrl: String,
    videoTitle: bilingual,
    videoDescription: bilingual
  }],
  militaryStrength: bilingual,
  culturalContributions: bilingual,
  architecture: bilingual,
  tradeAndEconomy: bilingual,
  decline: bilingual,
  legacy: bilingual,
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
dynastySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Dynasty", dynastySchema);
