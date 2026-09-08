import { connectDB } from "./mongodb";
import Setting from "../models/Setting";

const DEFAULTS = {
  customization_fee: "300",
  paybill_number: "",
  paybill_account_note: "Use your order number as the Account Number",
};

export async function getSettings(keys) {
  await connectDB();
  const docs = await Setting.find({ key: { $in: keys } });
  const found = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  const result = {};
  for (const key of keys) result[key] = found[key] ?? DEFAULTS[key] ?? "";
  return result;
}

export async function setSetting(key, value) {
  await connectDB();
  await Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true });
}

export async function getCustomizationFee() {
  const { customization_fee } = await getSettings(["customization_fee"]);
  return Number(customization_fee);
}

// Seeds default settings the first time — safe to call repeatedly.
export async function ensureDefaultSettings() {
  await connectDB();
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await Setting.findOneAndUpdate({ key }, { $setOnInsert: { key, value } }, { upsert: true });
  }
}
