import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  size: { type: String, enum: ["S", "M", "L", "XL", "2XL", "3XL"], required: true },
  sleeve: { type: String, enum: ["Short", "Long"], required: true },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 2 },
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  team: { type: String, required: true },
  kitType: { type: String, enum: ["Home", "Away", "Third"], required: true },
  version: { type: String, enum: ["Player Version", "Fan Version", "Kids Set"], required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  accent: { type: String },
  accent2: { type: String },
  photos: { type: [String], default: [] }, // Cloudinary URLs, min 3 enforced in the route handler
  variants: { type: [VariantSchema], default: [] },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
