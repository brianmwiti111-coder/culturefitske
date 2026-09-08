import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { requireAuth, AuthError } from "../../../../lib/auth";
import Order from "../../../../models/Order";

function withTotal(order) {
  const obj = order.toObject();
  return { ...obj, id: obj._id.toString(), total: obj.deliveryFee != null ? obj.subtotal + obj.deliveryFee : null };
}

// GET /api/orders/mine — the logged-in customer's own orders
export async function GET(request) {
  try {
    const user = requireAuth(request);
    await connectDB();
    const orders = await Order.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json(orders.map(withTotal));
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not load your orders." }, { status: 500 });
  }
}
