import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { requireAuth, AuthError } from "../../../../lib/auth";
import WishlistItem from "../../../../models/WishlistItem";

// POST /api/wishlist/:productId — add
export async function POST(request, { params }) {
  try {
    const user = requireAuth(request);
    await connectDB();
    await WishlistItem.findOneAndUpdate(
      { userId: user.id, productId: params.productId },
      { userId: user.id, productId: params.productId },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not save to wishlist." }, { status: 500 });
  }
}

// DELETE /api/wishlist/:productId — remove
export async function DELETE(request, { params }) {
  try {
    const user = requireAuth(request);
    await connectDB();
    await WishlistItem.deleteOne({ userId: user.id, productId: params.productId });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not remove from wishlist." }, { status: 500 });
  }
}
