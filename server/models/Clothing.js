import mongoose from "mongoose";

const ClothingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  image: { type: String },
});

const Clothing = mongoose.model("Clothing", ClothingSchema);
export default Clothing;
