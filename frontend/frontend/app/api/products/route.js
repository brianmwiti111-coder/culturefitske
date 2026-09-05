import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { requireAdmin, AuthError } from "../../../lib/auth";
import { uploadFile } from "../../../lib/cloudinary";
import Product from "../../../models/Product";
import Review from "../../../models/Review";

const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
const SLEEVES = ["Short", "Long"];

function defaultVariants() {
  const variants = [];
  for (const size of SIZES) for (const sleeve of SLEEVES) variants.push({ size, sleeve, stock: 0 });
  return variants;
}

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

// GET /api/products?team=&kit=&version= — public
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const filter = { active: true };
  if (searchParams.get("team")) filter.team = searchParams.get("team");
  if (searchParams.get("kit")) filter.kitType = searchParams.get("kit");
  if (searchParams.get("version")) filter.version = searchParams.get("version");

  const products = await Product.find(filter).sort({ createdAt: -1 });
  const hydrated = await Promise.all(products.map(withRating));
  return NextResponse.json(hydrated);
}

// POST /api/products — admin only. multipart/form-data: team, kitType, version, price,
// accent, accent2, photos (File, repeated, min 3)
export async function POST(request) {
  try {
    requireAdmin(request);
    await connectDB();

    const form = await request.formData();
    const team = form.get("team");
    const kitType = form.get("kitType");
    const version = form.get("version");
    const price = Number(form.get("price"));
    const accent = form.get("accent") || null;
    const accent2 = form.get("accent2") || null;
    const files = form.getAll("photos").filter((f) => typeof f !== "string");

    if (!team || !kitType || !version || !price) {
      return NextResponse.json({ error: "team, kitType, version and price are required." }, { status: 400 });
    }
    if (files.length < 3) {
      return NextResponse.json({ error: "Upload at least 3 product photos." }, { status: 400 });
    }

    const photos = await Promise.all(files.map((f) => uploadFile(f, "culturefitske/products")));

    const product = await Product.create({
      team, kitType, version, accent, accent2, photos,
      name: `${team} ${kitType} Kit`,
      price,
      variants: defaultVariants(),
    });

    return NextResponse.json(await withRating(product), { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
