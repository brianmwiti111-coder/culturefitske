import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { requireAdmin, AuthError } from "../../../../lib/auth";
import Review from "../../../../models/Review";

// DELETE /api/reviews/:id — admin only, moderation
export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    await connectDB();
    await Review.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not remove review." }, { status: 500 });
  }
}
