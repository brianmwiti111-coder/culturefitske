import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/mongodb";
import { requireAuth, AuthError } from "../../../../lib/auth";
import { rateLimit } from "../../../../lib/rateLimit";
import User from "../../../../models/User";

// POST /api/auth/change-password — Body: { currentPassword, newPassword }
// For a logged-in user who knows their current password. Use
// /auth/forgot-password + /auth/reset-password instead when they don't.
export async function POST(request) {
  try {
    const authUser = requireAuth(request);
    await connectDB();

    // 5 attempts per hour — someone guessing at a stolen session's current
    // password shouldn't get unlimited tries.
    const { success } = await rateLimit(`change-password:${authUser.id}`, { limit: 5, windowSeconds: 3600 });
    if (!success) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "Current password and a new password of at least 6 characters are required." }, { status: 400 });
    }

    const user = await User.findById(authUser.id);
    if (!user) return NextResponse.json({ error: "Account no longer exists." }, { status: 401 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not change password." }, { status: 500 });
  }
}
