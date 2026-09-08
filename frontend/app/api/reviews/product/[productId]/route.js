import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import Review from "../../../../../models/Review";

// GET /api/reviews/product/:productId — public
export async function GET(request, { params }) {
  await connectDB();
  const reviews = await Review.find({ productId: params.productId }).sort({ createdAt: -1 });
  return NextResponse.json(reviews);
}
