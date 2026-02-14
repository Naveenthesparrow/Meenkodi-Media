import mongoose from 'mongoose';

const DirectorSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ta: { type: String, required: true }
  },
  title: {
    en: { type: String, required: true },
    ta: { type: String, required: true }
  },
  image: { type: String, required: true },
  imagePosition: { type: String, default: 'center top' },
  slug: { type: String, unique: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Generate slug from English name if not provided
DirectorSchema.pre('save', function(next) {
  if (!this.slug && this.name && this.name.en) {
    this.slug = this.name.en
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

const Director = mongoose.model('Director', DirectorSchema);
export default Director;
