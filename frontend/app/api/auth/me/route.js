import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { requireAuth, publicUser, AuthError } from "../../../../lib/auth";
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
