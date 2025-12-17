import mongoose from "mongoose";

const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const gallerySchema = new mongoose.Schema({
  name: { type: bilingual, required: true }, // Person/Subject name
  category: { 
    type: String, 
    required: true,
    enum: ['Kings', 'Leaders', 'Poets', 'Freedom Fighters', 'Artists', 'Temples', 'Cultural Events', 'Traditional Crafts', 'Other']
  },
  customCategoryName: bilingual, // Used when category is "Other"
  description: bilingual,
  keywords: [String], // SEO keywords/hashtags
  era: String, // Time period (e.g., "Chola Period", "1900-1950")
  imageUrl: String,
  videoUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Gallery", gallerySchema);
