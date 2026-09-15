import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  size: { type: String, enum: ["S", "M", "L", "XL", "2XL", "3XL"], required: true },
  sleeve: { type: String, enum: ["Short", "Long"], required: true },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 2 },
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  // "Team / name" — required for jersey versions (identifies the club), optional
  // for accessory items like plain tracksuits or tracks where there's no team.
  team: { type: String, default: "" },
  // Only meaningful for jersey versions (Home/Away/Third kit). Left null for
  // accessory items like tracksuits/tracks, which don't have a kit side.
  kitType: { type: String, enum: ["Home", "Away", "Third", null], default: null },
  version: {
    type: String,
    enum: ["Player Version", "Fan Version", "Kids Set", "Tracksuit", "Retro Jersey", "Tracks"],
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  accent: { type: String },
  accent2: { type: String },
  photos: { type: [String], default: [] }, // Cloudinary URLs, min 3 enforced in the route handler
  customizationPhoto: { type: String, default: null }, // one of the photos[] URLs — where name/number/design get overlaid
  variants: { type: [VariantSchema], default: [] },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
