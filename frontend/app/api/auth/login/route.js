import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/mongodb";
import { signToken, publicUser } from "../../../../lib/auth";
import { rateLimit, getClientIp } from "../../../../lib/rateLimit";
import User from "../../../../models/User";

export async function POST(request) {
  // 8 attempts per 5 minutes per IP — enough for a real person who mistypes
  // their password a couple of times, not enough to brute-force one.
  const { success } = await rateLimit(`login:${getClientIp(request)}`, { limit: 8, windowSeconds: 300 });
  if (!success) {
    return NextResponse.json({ error: "Too many login attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  await connectDB();
  const { phone, password } = await request.json();

  if (typeof phone !== "string" || typeof password !== "string" || !phone || !password) {
    return NextResponse.json({ error: "Phone and password are required." }, { status: 400 });
  }

  const user = await User.findOne({ phone });
  if (!user) return NextResponse.json({ error: "Incorrect phone number or password." }, { status: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Incorrect phone number or password." }, { status: 401 });

  const token = signToken(user);
  return NextResponse.json({ token, user: publicUser(user) });
}
