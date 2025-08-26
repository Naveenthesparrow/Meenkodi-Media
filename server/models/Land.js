import mongoose from "mongoose";

const landSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["Kurinji", "Mullai", "Marutham", "Neithal", "Palai"],
    required: true,
  },
  description: String,
  poetry: [String],
  gods: [String],
  flora: [String],
  fauna: [String],
  people: [String],
  image: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Land", landSchema);
