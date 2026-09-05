import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { requireAuth, AuthError } from "../../../lib/auth";
import WishlistItem from "../../../models/WishlistItem";

// GET /api/wishlist — the logged-in customer's saved product IDs
export async function GET(request) {
  try {
    const user = requireAuth(request);
    await connectDB();
    const items = await WishlistItem.find({ userId: user.id });
    return NextResponse.json(items.map((i) => i.productId.toString()));
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not load wishlist." }, { status: 500 });
  }
}
