// Sends order/account notifications — WhatsApp Cloud API (Meta) if configured,
// otherwise goes straight to SMS via Africa's Talking. Meta is entirely
// optional: if WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN aren't set,
// this skips WhatsApp and sends SMS directly — no wasted failed API call.

function toE164(phone) {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("254")) return digits;
  return digits;
}

const whatsappConfigured = !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);

export async function sendWhatsAppMessage(phone, message) {
  if (!whatsappConfigured) {
    await sendSms(phone, message);
    return;
  }

  const to = toE164(phone);
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: message } }),
    });
    if (!res.ok) throw new Error(await res.text());
  } catch (err) {
    console.error("WhatsApp send failed, falling back to SMS:", err.message);
    await sendSms(phone, message);
  }
}

async function sendSms(phone, message) {
  if (!process.env.AT_API_KEY || !process.env.AT_USERNAME) {
    console.error("No messaging channel configured — set WHATSAPP_* or AT_* env vars to actually deliver this:", message);
    return;
  }

  const to = `+${toE164(phone)}`;
  try {
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey: process.env.AT_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({ username: process.env.AT_USERNAME, to, message, from: process.env.AT_SENDER_ID || "" }),
    });
    if (!res.ok) console.error("SMS send failed:", await res.text());
  } catch (err) {
    console.error("SMS send failed:", err.message);
  }
}
