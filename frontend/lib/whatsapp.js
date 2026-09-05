// WhatsApp Cloud API (Meta) — used to confirm delivery fee + final total with customers.
// Falls back to SMS via Africa's Talking if the WhatsApp send fails.

function toE164(phone) {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("254")) return digits;
  return digits;
}

export async function sendWhatsAppMessage(phone, message) {
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
  const to = `+${toE164(phone)}`;
  try {
    await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey: process.env.AT_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({ username: process.env.AT_USERNAME, to, message, from: process.env.AT_SENDER_ID || "" }),
    });
  } catch (err) {
    console.error("SMS fallback also failed:", err.message);
  }
}
