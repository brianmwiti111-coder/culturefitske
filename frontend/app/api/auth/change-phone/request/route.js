import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../../lib/mongodb";
import { requireAuth, AuthError } from "../../../../../lib/auth";
import { rateLimit } from "../../../../../lib/rateLimit";
import { sendWhatsAppMessage } from "../../../../../lib/whatsapp";
import User from "../../../../../models/User";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

// POST /api/auth/change-phone/request — Body: { newPhone }
// Sends a verification code to the NEW number (not the old one) — proving the
// account holder can actually receive messages there before we let it become
// their login number.
export async function POST(request) {
  try {
    const authUser = requireAuth(request);
    await connectDB();

    const { success } = await rateLimit(`change-phone:${authUser.id}`, { limit: 5, windowSeconds: 3600 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { newPhone } = await request.json();
    if (typeof newPhone !== "string" || !newPhone.trim()) {
      return NextResponse.json({ error: "A new phone number is required." }, { status: 400 });
    }
    const cleaned = newPhone.trim();

    const user = await User.findById(authUser.id);
    if (!user) return NextResponse.json({ error: "Account no longer exists." }, { status: 401 });

    if (cleaned === user.phone) {
      return NextResponse.json({ error: "That's already your current number." }, { status: 400 });
    }

    const taken = await User.findOne({ phone: cleaned });
    if (taken) {
      return NextResponse.json({ error: "That phone number is already in use on another account." }, { status: 409 });
    }

    const code = generateCode();
    user.pendingPhone = cleaned;
    user.pendingPhoneCodeHash = await bcrypt.hash(code, 10);
    user.pendingPhoneCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    try {
      await sendWhatsAppMessage(cleaned, `Your CultureFitsKe phone verification code is ${code}. It expires in 15 minutes.`);
    } catch (err) {
      console.error("Phone verification code send failed:", err.message);
    }

    return NextResponse.json({ message: "A verification code has been sent to your new number." });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not start phone number change." }, { status: 500 });
  }
}
