import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/mongodb";
import { signToken, publicUser } from "../../../../lib/auth";
import { rateLimit, getClientIp } from "../../../../lib/rateLimit";
import User from "../../../../models/User";

// POST /api/auth/reset-password — Body: { phone, code, newPassword }
// On success, logs the person in (same as a normal login) so they don't have
// to reset then separately log in.
export async function POST(request) {
  const { phone, code, newPassword } = await request.json();

  if (typeof phone !== "string" || typeof code !== "string" || typeof newPassword !== "string" ||
      !phone || !code || newPassword.length < 6) {
    return NextResponse.json({ error: "Phone, code, and a new password of at least 6 characters are required." }, { status: 400 });
  }

  // 5 attempts per hour per phone+IP — enough to fix a typo in the code, not
  // enough to brute-force a 6-digit code (1 in a million per guess anyway).
  const { success } = await rateLimit(`reset-password:${phone}:${getClientIp(request)}`, { limit: 5, windowSeconds: 3600 });
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Please request a new code and try again later." }, { status: 429 });
  }

  await connectDB();
  const genericError = { error: "That code is invalid or has expired. Please request a new one." };

  const user = await User.findOne({ phone });
  if (!user || !user.resetCodeHash || !user.resetCodeExpires || user.resetCodeExpires < new Date()) {
    return NextResponse.json(genericError, { status: 400 });
  }

  const valid = await bcrypt.compare(code, user.resetCodeHash);
  if (!valid) return NextResponse.json(genericError, { status: 400 });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetCodeHash = null;
  user.resetCodeExpires = null;
  await user.save();

  const token = signToken(user);
  return NextResponse.json({ token, user: publicUser(user) });
}
