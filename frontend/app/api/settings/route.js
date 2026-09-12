import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "../../../lib/auth";
import { getSettings, setSetting, ensureDefaultSettings } from "../../../lib/settings";

const PUBLIC_KEYS = [
  "customization_fee", "paybill_number", "paybill_account_note",
  "store_address", "store_map_link", "contact_whatsapp_number",
];

function shape(settings) {
  return {
    customizationFee: Number(settings.customization_fee),
    paybillNumber: settings.paybill_number,
    paybillAccountNote: settings.paybill_account_note,
    storeAddress: settings.store_address,
    storeMapLink: settings.store_map_link,
    contactWhatsappNumber: settings.contact_whatsapp_number,
  };
}

// GET /api/settings — public. Used by the storefront at checkout, product customization,
// the "Visit Us" section, and the "Contact Us" button.
export async function GET() {
  await ensureDefaultSettings();
  const settings = await getSettings(PUBLIC_KEYS);
  return NextResponse.json(shape(settings));
}

// PATCH /api/settings — admin only.
// Body: { customizationFee?, paybillNumber?, paybillAccountNote?, storeAddress?, storeMapLink?, contactWhatsappNumber? }
export async function PATCH(request) {
  try {
    requireAdmin(request);

    const { customizationFee, paybillNumber, paybillAccountNote, storeAddress, storeMapLink, contactWhatsappNumber } = await request.json();

    if (customizationFee != null) {
      const fee = Number(customizationFee);
      if (Number.isNaN(fee) || fee < 0) {
        return NextResponse.json({ error: "customizationFee must be a non-negative number." }, { status: 400 });
      }
      await setSetting("customization_fee", String(fee));
    }
    if (paybillNumber != null) await setSetting("paybill_number", String(paybillNumber).trim());
    if (paybillAccountNote != null) await setSetting("paybill_account_note", String(paybillAccountNote).trim());
    if (storeAddress != null) await setSetting("store_address", String(storeAddress).trim());
    if (storeMapLink != null) await setSetting("store_map_link", String(storeMapLink).trim());
    if (contactWhatsappNumber != null) await setSetting("contact_whatsapp_number", String(contactWhatsappNumber).trim());

    const settings = await getSettings(PUBLIC_KEYS);
    return NextResponse.json(shape(settings));
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Could not update settings." }, { status: 500 });
  }
}
