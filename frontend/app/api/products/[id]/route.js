import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { requireAdmin, AuthError } from "../../../../lib/auth";
import Product from "../../../../models/Product";
import Review from "../../../../models/Review";

async function withRating(product) {
  const reviews = await Review.find({ productId: product._id });
  const rating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const obj = product.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    stock: Object.fromEntries(obj.variants.map((v) => [`${v.size}-${v.sleeve}`, v.stock])),
    rating: Number(rating.toFixed(1)),
    reviewCount: reviews.length,
  };
}

// GET /api/products/:id — public
export async function GET(request, { params }) {
  await connectDB();
  const product = await Product.findById(params.id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json(await withRating(product));
}

// DELETE /api/products/:id — admin only. Soft delete, keeps order history intact.
export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    await connectDB();
    await Product.findByIdAndUpdate(params.id, { active: false });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not remove product." }, { status: 500 });
  }
}
