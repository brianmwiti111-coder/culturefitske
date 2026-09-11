import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/mongodb";
import { rateLimit, getClientIp } from "../../../../lib/rateLimit";
import { sendWhatsAppMessage } from "../../../../lib/whatsapp";
import User from "../../../../models/User";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

// POST /api/auth/forgot-password — Body: { phone }
// Always returns a generic success message, whether or not that phone has an
// account — so this can't be used to check which phone numbers are registered.
export async function POST(request) {
  const { phone } = await request.json();

  if (typeof phone !== "string" || !phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  // 3 requests per hour per phone+IP combo — enough for a genuine forgetful
  // customer, not enough to spam someone else's phone with codes.
  const { success } = await rateLimit(`forgot-password:${phone}:${getClientIp(request)}`, { limit: 3, windowSeconds: 3600 });
  if (!success) {
    return NextResponse.json({ error: "Too many reset requests. Please wait before trying again." }, { status: 429 });
  }

  await connectDB();
  const genericResponse = { message: "If that phone number has an account, a reset code has been sent." };

  const user = await User.findOne({ phone });
  if (!user) return NextResponse.json(genericResponse);

  const code = generateCode();
  user.resetCodeHash = await bcrypt.hash(code, 10);
  user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  try {
    await sendWhatsAppMessage(phone, `Your CultureFitsKe password reset code is ${code}. It expires in 15 minutes. If you didn't request this, you can ignore it.`);
  } catch (err) {
    console.error("Reset code send failed:", err.message);
  }

  return NextResponse.json(genericResponse);
}
