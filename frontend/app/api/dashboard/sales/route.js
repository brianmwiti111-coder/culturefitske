import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { requireAdmin, AuthError } from "../../../../lib/auth";
import Order from "../../../../models/Order";

// GET /api/dashboard/sales?range=daily|weekly|monthly — admin only
export async function GET(request) {
  try {
    requireAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "daily";
    const unit = range === "weekly" ? "week" : range === "monthly" ? "month" : "day";

    const rows = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: { $dateTrunc: { date: "$createdAt", unit } },
          revenue: { $sum: { $add: ["$subtotal", { $ifNull: ["$deliveryFee", 0] }] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    return NextResponse.json(rows.map((r) => ({ period: r._id, revenue: r.revenue, orders: r.orders })));
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not load sales data." }, { status: 500 });
  }
}
