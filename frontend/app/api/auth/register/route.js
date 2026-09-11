import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/mongodb";
import { signToken, publicUser } from "../../../../lib/auth";
import { rateLimit, getClientIp } from "../../../../lib/rateLimit";
import User from "../../../../models/User";

export async function POST(request) {
  // 5 new accounts per hour per IP — generous for a real household, blocks
  // scripted mass account creation.
  const { success } = await rateLimit(`register:${getClientIp(request)}`, { limit: 5, windowSeconds: 3600 });
  if (!success) {
    return NextResponse.json({ error: "Too many accounts created recently. Please try again later." }, { status: 429 });
  }

  await connectDB();
  const { name, phone, email, password } = await request.json();

  if (typeof name !== "string" || typeof phone !== "string" || typeof password !== "string" ||
      !name || !phone || !password || password.length < 6) {
    return NextResponse.json({ error: "Name, phone, and a password of at least 6 characters are required." }, { status: 400 });
  }
  if (email != null && typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const existing = await User.findOne({ phone });
  if (existing) {
    return NextResponse.json({ error: "An account with that phone number already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, phone, email, passwordHash, role: "customer" });

  const token = signToken(user);
  return NextResponse.json({ token, user: publicUser(user) }, { status: 201 });
}
