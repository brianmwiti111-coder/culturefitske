import mongoose from "mongoose";

const WishlistItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
}, { timestamps: true });

WishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.WishlistItem || mongoose.model("WishlistItem", WishlistItemSchema);
