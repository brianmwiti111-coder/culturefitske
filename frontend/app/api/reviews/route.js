import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { requireAuth, AuthError } from "../../../lib/auth";
import { rateLimit } from "../../../lib/rateLimit";
import Review from "../../../models/Review";
import User from "../../../models/User";

// POST /api/reviews — customer leaves a review. Body: { productId, rating, comment }
export async function POST(request) {
  try {
    const authUser = requireAuth(request);
    await connectDB();

    // 5 reviews per hour per account — enough for a genuine shopper, blocks review-bombing.
    const { success } = await rateLimit(`review:${authUser.id}`, { limit: 5, windowSeconds: 3600 });
    if (!success) {
      return NextResponse.json({ error: "Too many reviews submitted recently. Please try again later." }, { status: 429 });
    }

    const { productId, rating, comment } = await request.json();
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "productId and a rating from 1-5 are required." }, { status: 400 });
    }

    const user = await User.findById(authUser.id);
    const review = await Review.create({ productId, userId: authUser.id, userName: user.name, rating, comment });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not save review." }, { status: 500 });
  }
}
