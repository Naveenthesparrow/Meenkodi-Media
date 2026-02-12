import mongoose from "mongoose";

const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const researchFolderSchema = new mongoose.Schema({
  name: { type: bilingual, required: true },
  description: bilingual,
  coverPhoto: { type: String, trim: true, default: '' }, // Cover photo URL
  // Photos belonging to this heritage collection (per country/region)
  photos: [
    {
      url: { type: String, trim: true, default: '' },
      caption: bilingual,
      credit: { type: String, trim: true, default: '' },
      name: bilingual,
      keywords: { type: [String], default: [] },
      sourceLink: { type: String, trim: true, default: '' },
      order: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("ResearchFolder", researchFolderSchema);
