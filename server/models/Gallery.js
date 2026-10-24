import mongoose from "mongoose";
import { addSlug } from "../utils/slug.js";

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
  keywords: [String], // SEO keywords/hashtags (e.g., "Jallikattu", "Tamil King", "Pandiya")
  era: String, // Time period (e.g., "Chola Period", "1900-1950")
  imageUrl: String,
  videoUrl: String,
  imageAlt: bilingual, // Alt text for image (SEO & accessibility)
  seoTitle: bilingual, // SEO-optimized title for search engines
  seoDescription: bilingual, // SEO-optimized description for search results
  tags: [String], // Additional search tags (e.g., "sport", "culture", "tradition")
  location: String, // Geographic location (e.g., "Madurai", "Tamil Nadu")
  isFolder: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Readable URL (e.g. /explore/temples/meenakshi-amman-temple) instead of the id
addSlug(gallerySchema);

export default mongoose.model("Gallery", gallerySchema);
