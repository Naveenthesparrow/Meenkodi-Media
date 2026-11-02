import mongoose from "mongoose";

const bilingual = {
  en: { type: String, trim: true, default: "" },
  ta: { type: String, trim: true, default: "" },
};

// Photos for the home page "Heritage in Pictures" band, chosen by admins
// (first photo = the large tile). A single document holds the whole list.
const homeShowcaseSchema = new mongoose.Schema({
  key: { type: String, default: "home", unique: true },
  photos: [
    {
      image: { type: String, trim: true, required: true },
      title: bilingual,
      link: { type: String, trim: true, default: "" },
      // CSS object-position for the crop, e.g. "center 20%" keeps faces in frame
      focus: { type: String, trim: true, default: "center 20%" },
      // Copy of this photo in the Gallery folder "Heritage in Pictures" (kept in sync on save)
      galleryId: { type: mongoose.Schema.Types.ObjectId, ref: "Gallery" },
      gallerySlug: { type: String, default: "" },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("HomeShowcase", homeShowcaseSchema);
