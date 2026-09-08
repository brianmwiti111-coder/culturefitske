import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
