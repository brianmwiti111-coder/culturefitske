import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../../lib/mongodb";
import { requireAuth, publicUser, AuthError } from "../../../../../lib/auth";
import { rateLimit } from "../../../../../lib/rateLimit";
import User from "../../../../../models/User";

// POST /api/auth/change-phone/confirm — Body: { code }
export async function POST(request) {
  try {
    const authUser = requireAuth(request);
    await connectDB();

    const { success } = await rateLimit(`change-phone-confirm:${authUser.id}`, { limit: 5, windowSeconds: 3600 });
    if (!success) {
      return NextResponse.json({ error: "Too many attempts. Please request a new code and try again later." }, { status: 429 });
    }

    const { code } = await request.json();
    if (typeof code !== "string" || !code) {
      return NextResponse.json({ error: "A code is required." }, { status: 400 });
    }

    const genericError = { error: "That code is invalid or has expired. Please request a new one." };

    const user = await User.findById(authUser.id);
    if (!user || !user.pendingPhone || !user.pendingPhoneCodeHash || !user.pendingPhoneCodeExpires ||
        user.pendingPhoneCodeExpires < new Date()) {
      return NextResponse.json(genericError, { status: 400 });
    }

    const valid = await bcrypt.compare(code, user.pendingPhoneCodeHash);
    if (!valid) return NextResponse.json(genericError, { status: 400 });

    // Re-check uniqueness in case someone else grabbed this number in the meantime.
    const taken = await User.findOne({ phone: user.pendingPhone, _id: { $ne: user._id } });
    if (taken) {
      user.pendingPhone = null;
      user.pendingPhoneCodeHash = null;
      user.pendingPhoneCodeExpires = null;
      await user.save();
      return NextResponse.json({ error: "That phone number was just taken by another account. Please try a different number." }, { status: 409 });
    }

    user.phone = user.pendingPhone;
    user.pendingPhone = null;
    user.pendingPhoneCodeHash = null;
    user.pendingPhoneCodeExpires = null;
    await user.save();

    return NextResponse.json({ user: publicUser(user) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not confirm phone number change." }, { status: 500 });
  }
}
