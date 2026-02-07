import mongoose from "mongoose";

const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const articleSchema = new mongoose.Schema({
  title: { type: bilingual, required: true },
  content: bilingual,
  author: bilingual, // Legacy field for old articles
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  authorEmail: String,
  image: String,
  videoUrl: String,
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'published', 'rejected'], 
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  publishedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  viewCount: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Article", articleSchema);
