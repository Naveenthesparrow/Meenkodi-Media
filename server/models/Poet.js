import mongoose from "mongoose";

const poetSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ta: { type: String, required: true }
  },
  slug: { type: String, required: true, unique: true },
  title: {
    en: { type: String, required: true },
    ta: { type: String, required: true }
  },
  image: { type: String },
  imagePosition: { type: String, default: "center top" },
  period: {
    en: { type: String },
    ta: { type: String }
  },
  birthPlace: {
    en: { type: String },
    ta: { type: String }
  },
  description: {
    en: { type: String },
    ta: { type: String }
  },
  biography: {
    en: { type: String },
    ta: { type: String }
  },
  majorWorks: [{
    title: {
      en: { type: String },
      ta: { type: String }
    },
    description: {
      en: { type: String },
      ta: { type: String }
    }
  }],
  contributions: {
    en: { type: String },
    ta: { type: String }
  },
  philosophy: {
    en: { type: String },
    ta: { type: String }
  },
  famousQuotes: [{
    quote: {
      en: { type: String },
      ta: { type: String }
    },
    source: {
      en: { type: String },
      ta: { type: String }
    }
  }],
  legacy: {
    en: { type: String },
    ta: { type: String }
  },
  awards: {
    en: { type: String },
    ta: { type: String }
  },
  gallery: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: String,
      createdAt: { type: Date, default: Date.now },
      replies: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          content: String,
          createdAt: { type: Date, default: Date.now }
        }
      ]
    }
  ]
}, { timestamps: true });

export default mongoose.model("Poet", poetSchema);
