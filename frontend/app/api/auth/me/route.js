import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { requireAuth, publicUser, AuthError } from "../../../../lib/auth";
import { rateLimit } from "../../../../lib/rateLimit";
import User from "../../../../models/User";

// GET /api/auth/me — returns the logged-in user (including role), based on the JWT.
// The frontend calls this on load to check "is this a real admin?" rather than trusting
// anything stored client-side.
export async function GET(request) {
  try {
    const authUser = requireAuth(request);
    await connectDB();
    const user = await User.findById(authUser.id);
    if (!user) return NextResponse.json({ error: "Account no longer exists." }, { status: 401 });
    return NextResponse.json({ user: publicUser(user) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not verify session." }, { status: 500 });
  }
}

// PATCH /api/auth/me — edit profile. Body: { name?, email? }
// Phone is intentionally not editable here, since it's the login identifier —
// changing it would need its own verified flow, not a plain profile edit.
export async function PATCH(request) {
  try {
    const authUser = requireAuth(request);
    await connectDB();

    const { success } = await rateLimit(`edit-profile:${authUser.id}`, { limit: 10, windowSeconds: 3600 });
    if (!success) {
      return NextResponse.json({ error: "Too many profile updates. Please try again later." }, { status: 429 });
    }

    const { name, email } = await request.json();
    const update = {};
    if (name != null) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Name can't be empty." }, { status: 400 });
      }
      update.name = name.trim();
    }
    if (email != null) {
      if (typeof email !== "string") {
        return NextResponse.json({ error: "Invalid email." }, { status: 400 });
      }
      update.email = email.trim();
    }

    const user = await User.findByIdAndUpdate(authUser.id, update, { new: true });
    if (!user) return NextResponse.json({ error: "Account no longer exists." }, { status: 401 });
    return NextResponse.json({ user: publicUser(user) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }
}
