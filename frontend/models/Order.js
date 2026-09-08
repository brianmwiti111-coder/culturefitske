import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },   // snapshotted at order time
  size: { type: String, required: true },
  sleeve: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },      // includes customization fee if any
  customName: { type: String },
  customNumber: { type: String },
  customFont: { type: String },
  customNamePosition: { type: String, enum: ["above", "below"] },
  customDesignUrl: { type: String },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [OrderItemSchema], required: true },
  deliveryLocation: { type: String, required: true },
  deliveryNotes: { type: String },
  contactPhone: { type: String, required: true },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: null }, // null until admin sets it
  paymentMethod: { type: String, enum: ["mpesa", "cash"], required: true },
  paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
  status: {
    type: String,
    enum: ["Requested", "Awaiting Confirmation", "Confirmed", "Processing", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Requested",
  },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
