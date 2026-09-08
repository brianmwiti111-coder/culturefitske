import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "../../../lib/auth";
import { getSettings, setSetting, ensureDefaultSettings } from "../../../lib/settings";

const PUBLIC_KEYS = ["customization_fee", "paybill_number", "paybill_account_note"];

// GET /api/settings — public. Used by the storefront at checkout and product customization.
export async function GET() {
  await ensureDefaultSettings();
  const settings = await getSettings(PUBLIC_KEYS);
  return NextResponse.json({
    customizationFee: Number(settings.customization_fee),
    paybillNumber: settings.paybill_number,
    paybillAccountNote: settings.paybill_account_note,
  });
}

// PATCH /api/settings — admin only. Body: { customizationFee?, paybillNumber?, paybillAccountNote? }
export async function PATCH(request) {
  try {
    requireAdmin(request);

    const { customizationFee, paybillNumber, paybillAccountNote } = await request.json();

    if (customizationFee != null) {
      const fee = Number(customizationFee);
      if (Number.isNaN(fee) || fee < 0) {
        return NextResponse.json({ error: "customizationFee must be a non-negative number." }, { status: 400 });
      }
      await setSetting("customization_fee", String(fee));
    }
    if (paybillNumber != null) await setSetting("paybill_number", String(paybillNumber).trim());
    if (paybillAccountNote != null) await setSetting("paybill_account_note", String(paybillAccountNote).trim());

    const settings = await getSettings(PUBLIC_KEYS);
    return NextResponse.json({
      customizationFee: Number(settings.customization_fee),
      paybillNumber: settings.paybill_number,
      paybillAccountNote: settings.paybill_account_note,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not update settings." }, { status: 500 });
  }
}
