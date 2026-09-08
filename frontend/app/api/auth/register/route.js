import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/mongodb";
import { signToken, publicUser } from "../../../../lib/auth";
import User from "../../../../models/User";

export async function POST(request) {
  await connectDB();
  const { name, phone, email, password } = await request.json();

  if (!name || !phone || !password || password.length < 6) {
    return NextResponse.json({ error: "Name, phone, and a password of at least 6 characters are required." }, { status: 400 });
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
