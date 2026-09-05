import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/mongodb";
import { signToken, publicUser } from "../../../../lib/auth";
import User from "../../../../models/User";

export async function POST(request) {
  await connectDB();
  const { phone, password } = await request.json();

  if (!phone || !password) {
    return NextResponse.json({ error: "Phone and password are required." }, { status: 400 });
  }

  const user = await User.findOne({ phone });
  if (!user) return NextResponse.json({ error: "Incorrect phone number or password." }, { status: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Incorrect phone number or password." }, { status: 401 });

  const token = signToken(user);
  return NextResponse.json({ token, user: publicUser(user) });
}
