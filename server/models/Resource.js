import mongoose from "mongoose";

const bilingual = {
  en: { type: String, trim: true },
  ta: { type: String, trim: true }
};

const resourceSchema = new mongoose.Schema({
  title: { type: bilingual, required: true },
  description: bilingual,
  category: bilingual,
  author: bilingual,
  image: String,
  downloadLink: String,
  pdfSize: String,
  pdfName: String,
  format: { type: String, default: "PDF" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Resource", resourceSchema);
