import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { requireAuth, requireAdmin, AuthError } from "../../../lib/auth";
import { getCustomizationFee } from "../../../lib/settings";
import Product from "../../../models/Product";
import Order from "../../../models/Order";

function withTotal(order) {
  const obj = order.toObject();
  return { ...obj, id: obj._id.toString(), total: obj.deliveryFee != null ? obj.subtotal + obj.deliveryFee : null };
}

async function nextOrderNumber() {
  const count = await Order.countDocuments();
  return `ORD-${1000 + count}`;
}

// POST /api/orders — customer places an order request (unpaid; admin confirms fee + total next)
// Body: { items: [{ productId, size, sleeve, quantity, customization? }], deliveryLocation, deliveryNotes, contactPhone, paymentMethod }
export async function POST(request) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const { items, deliveryLocation, deliveryNotes, contactPhone, paymentMethod } = await request.json();

    if (!items || items.length === 0) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    if (!deliveryLocation || !contactPhone) return NextResponse.json({ error: "Delivery location and phone are required." }, { status: 400 });
    if (!["mpesa", "cash"].includes(paymentMethod)) return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });

    const customFee = await getCustomizationFee();
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, active: true });
      if (!product) throw new Error("One of the items in your cart is no longer available.");

      const variant = product.variants.find((v) => v.size === item.size && v.sleeve === item.sleeve);
      if (!variant || variant.stock < item.quantity) {
        throw new Error(`${product.name} (${item.size}/${item.sleeve}) doesn't have enough stock.`);
      }

      const hasCustomization = !!item.customization;
      const unitPrice = product.price + (hasCustomization ? customFee : 0);
      subtotal += unitPrice * item.quantity;

      resolvedItems.push({
        productId: product._id,
        productName: product.name,
        size: item.size,
        sleeve: item.sleeve,
        quantity: item.quantity,
        unitPrice,
        customName: item.customization?.name || null,
        customNumber: item.customization?.number || null,
        customFont: item.customization?.font || null,
        customNamePosition: item.customization?.namePosition || null,
        customDesignUrl: item.customization?.designUrl || null,
      });

      // Decrement stock immediately to prevent overselling while the order is pending confirmation.
      variant.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      userId: user.id,
      items: resolvedItems,
      deliveryLocation,
      deliveryNotes,
      contactPhone,
      subtotal,
      paymentMethod,
    });

    return NextResponse.json(withTotal(order), { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: err.message || "Could not place order." }, { status: 400 });
  }
}

// GET /api/orders — admin only, all orders
export async function GET(request) {
  try {
    requireAdmin(request);
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders.map(withTotal));
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}
