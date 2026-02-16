import mongoose from "mongoose";

const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const articleSchema = new mongoose.Schema({
  title: bilingual,
  content: bilingual,
  author: bilingual, // Legacy field for old articles
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  authorEmail: String,
  image: String,
  imageLink: String,
  videoUrl: String,
  videoLink: String,
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

// Validation to ensure title has at least one language
articleSchema.pre('save', function(next) {
  if (!this.title || (!this.title.en && !this.title.ta)) {
    next(new Error('Title must have at least one language (English or Tamil)'));
  } else {
    next();
  }
});

export default mongoose.model("Article", articleSchema);
