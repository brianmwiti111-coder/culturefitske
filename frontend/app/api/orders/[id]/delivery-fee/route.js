import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { requireAdmin, AuthError } from "../../../../../lib/auth";
import { getSettings } from "../../../../../lib/settings";
import { sendWhatsAppMessage } from "../../../../../lib/whatsapp";
import Order from "../../../../../models/Order";

// PATCH /api/orders/:id/delivery-fee — admin only. Sets the fee, then sends a WhatsApp
// confirmation message to the customer with the final total (and Paybill details if paying by M-Pesa).
export async function PATCH(request, { params }) {
  try {
    requireAdmin(request);
    await connectDB();

    const { deliveryFee } = await request.json();
    if (typeof deliveryFee !== "number" || deliveryFee < 0) {
      return NextResponse.json({ error: "deliveryFee must be a non-negative number." }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { deliveryFee, status: "Awaiting Confirmation" },
      { new: true }
    );
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const total = order.subtotal + deliveryFee;
    try {
      let message = `Hi! Thanks for your CultureFitsKe order. Delivery to ${order.deliveryLocation} is KSh ${deliveryFee}. Your total is KSh ${total}.`;

      if (order.paymentMethod === "mpesa") {
        const { paybill_number, paybill_account_note } = await getSettings(["paybill_number", "paybill_account_note"]);
        if (paybill_number) {
          message += ` Pay via M-Pesa Paybill ${paybill_number}, Account Number: ${order.orderNumber}` +
            (paybill_account_note ? ` (${paybill_account_note})` : "") + `.`;
        }
      }

      message += ` Reply YES to confirm and we'll get it moving.`;
      await sendWhatsAppMessage(order.contactPhone, message);
    } catch (err) {
      console.error("WhatsApp send failed:", err.message);
    }

    const obj = order.toObject();
    return NextResponse.json({ ...obj, id: obj._id.toString(), total });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not set delivery fee." }, { status: 500 });
  }
}
