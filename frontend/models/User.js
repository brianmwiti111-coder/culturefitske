import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  resetCodeHash: { type: String, default: null },   // hashed 6-digit code for forgot-password
  resetCodeExpires: { type: Date, default: null },
  pendingPhone: { type: String, default: null },          // new number awaiting verification
  pendingPhoneCodeHash: { type: String, default: null },  // hashed 6-digit code sent to pendingPhone
  pendingPhoneCodeExpires: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
