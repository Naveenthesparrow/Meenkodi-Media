import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  photo: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
});

export default mongoose.model("User", userSchema);
