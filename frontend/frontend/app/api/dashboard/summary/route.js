import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { requireAdmin, AuthError } from "../../../../lib/auth";
import Order from "../../../../models/Order";
import Product from "../../../../models/Product";

// GET /api/dashboard/summary — admin only
export async function GET(request) {
  try {
    requireAdmin(request);
    await connectDB();

    const [pendingOrders, deliveredOrders, products] = await Promise.all([
      Order.countDocuments({ status: { $nin: ["Delivered", "Cancelled"] } }),
      Order.find({ status: "Delivered" }),
      Product.find({ active: true }),
    ]);

    const revenue = deliveredOrders.reduce((sum, o) => sum + o.subtotal + (o.deliveryFee || 0), 0);

    const lowStockVariants = [];
    for (const p of products) {
      for (const v of p.variants) {
        if (v.stock > 0 && v.stock <= v.lowStockThreshold) {
          lowStockVariants.push({ productId: p._id.toString(), name: p.name, size: v.size, sleeve: v.sleeve, stock: v.stock });
        }
      }
    }

    const unitsByProduct = {};
    for (const o of deliveredOrders) {
      for (const item of o.items) {
        unitsByProduct[item.productName] = (unitsByProduct[item.productName] || 0) + item.quantity;
      }
    }
    const topProducts = Object.entries(unitsByProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, unitsSold]) => ({ name, unitsSold }));

    return NextResponse.json({ pendingOrders, revenue, lowStockVariants, topProducts });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not load dashboard summary." }, { status: 500 });
  }
}
