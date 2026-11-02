import mongoose from "mongoose";

// Small editable blocks of site text, one document per key (e.g. "home-stats":
// the home page quote and numbers). The shape of `data` is checked by the route.
const siteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("SiteContent", siteContentSchema);
