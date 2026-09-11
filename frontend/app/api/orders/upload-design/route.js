import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "../../../../lib/auth";
import { uploadFile } from "../../../../lib/cloudinary";
import { rateLimit } from "../../../../lib/rateLimit";

// POST /api/orders/upload-design — customer uploads a custom badge/graphic before checkout.
// multipart/form-data: design (File). Returns { url } to include as customization.designUrl.
export async function POST(request) {
  try {
    const user = requireAuth(request);

    // 20 uploads per hour per account — generous for genuine customization,
    // blocks a script from filling your Cloudinary storage with junk.
    const { success } = await rateLimit(`design-upload:${user.id}`, { limit: 20, windowSeconds: 3600 });
    if (!success) {
      return NextResponse.json({ error: "Too many uploads recently. Please try again later." }, { status: 429 });
    }

    const form = await request.formData();
    const file = form.get("design");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    const url = await uploadFile(file, "culturefitske/custom-designs");
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not upload design." }, { status: 500 });
  }
}
