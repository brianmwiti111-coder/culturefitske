import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { requireAdmin, AuthError } from "../../../../../lib/auth";
import Order from "../../../../../models/Order";

const VALID_STATUSES = ["Requested", "Awaiting Confirmation", "Confirmed", "Processing", "Out for Delivery", "Delivered", "Cancelled"];

// PATCH /api/orders/:id/status — admin only
export async function PATCH(request, { params }) {
  try {
    requireAdmin(request);
    await connectDB();

    const { status } = await request.json();
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(params.id, { status }, { new: true });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const obj = order.toObject();
    return NextResponse.json({ ...obj, id: obj._id.toString(), total: obj.deliveryFee != null ? obj.subtotal + obj.deliveryFee : null });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not update status." }, { status: 500 });
  }
}
