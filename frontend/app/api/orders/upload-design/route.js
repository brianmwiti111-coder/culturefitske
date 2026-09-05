import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "../../../../lib/auth";
import { uploadFile } from "../../../../lib/cloudinary";

// POST /api/orders/upload-design — customer uploads a custom badge/graphic before checkout.
// multipart/form-data: design (File). Returns { url } to include as customization.designUrl.
export async function POST(request) {
  try {
    requireAuth(request);
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
