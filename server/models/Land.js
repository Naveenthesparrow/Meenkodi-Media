import mongoose from "mongoose";

// Bilingual sub-schema reused for key textual fields
const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const landSchema = new mongoose.Schema({
  // Keep canonical ecological type code (enum) for filtering / logic
  type: {
    type: String,
    enum: ["Kurinji", "Mullai", "Marutham", "Neithal", "Palai"],
    required: true,
  },
  // Store bilingual display name independent of enum code
  name: { type: bilingual, required: true },
  description: bilingual,
  // Retain arrays as simple strings for now (future: could be bilingual array)
  poetry: [String],
  gods: [String],
  flora: [String],
  fauna: [String],
  people: [String],
  contentSections: [{
    subtitle: bilingual,
    content: bilingual,
    imageUrl: String,
    imageLink: String,
    videoUrl: String,
    videoTitle: bilingual,
    videoDescription: bilingual,
  }],
  image: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Land", landSchema);
