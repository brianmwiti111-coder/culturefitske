import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { requireAdmin, AuthError } from "../../../../../lib/auth";
import Product from "../../../../../models/Product";

const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
const SLEEVES = ["Short", "Long"];

// PATCH /api/products/:id/stock — admin only. Body: { size, sleeve, stock }
export async function PATCH(request, { params }) {
  try {
    requireAdmin(request);
    await connectDB();

    const { size, sleeve, stock } = await request.json();
    if (!SIZES.includes(size) || !SLEEVES.includes(sleeve) || typeof stock !== "number") {
      return NextResponse.json({ error: "Valid size, sleeve and stock are required." }, { status: 400 });
    }

    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const variant = product.variants.find((v) => v.size === size && v.sleeve === sleeve);
    if (variant) variant.stock = stock;
    else product.variants.push({ size, sleeve, stock });

    await product.save();
    return NextResponse.json({
      id: product._id.toString(),
      stock: Object.fromEntries(product.variants.map((v) => [`${v.size}-${v.sleeve}`, v.stock])),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not update stock." }, { status: 500 });
  }
}
