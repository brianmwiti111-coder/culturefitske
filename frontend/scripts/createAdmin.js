// Creates (or promotes) the store owner's admin account.
// This is deliberately a script you run yourself, not an API route —
// letting anyone hit an endpoint to make themselves admin would defeat the point.
//
// Usage:
//   node scripts/createAdmin.js "Your Name" "0712345678" "a-strong-password"
//
// Make sure MONGODB_URI is set — either export it in your shell, or run with:
//   node -r dotenv/config scripts/createAdmin.js "..." "..." "..." dotenv_config_path=.env.local

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function main() {
  // Strip any dotenv_config_* flags (from `-r dotenv/config`) so they can't
  // shift the positional arguments below, regardless of where npm/node places them.
  const args = process.argv.slice(2).filter((a) => a !== "--" && !a.startsWith("dotenv_config_"));
  const [name, phone, password] = args;

  if (!name || !phone || !password) {
    console.error('Usage: node scripts/createAdmin.js "Your Name" "0712345678" "a-strong-password"');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Run with: node -r dotenv/config scripts/createAdmin.js ... dotenv_config_path=.env.local");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const UserSchema = new mongoose.Schema({
    name: String, phone: String, email: String, passwordHash: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  }, { timestamps: true });
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ phone });

  if (existing) {
    existing.role = "admin";
    existing.passwordHash = passwordHash; // reset password too, since you're running this yourself
    await existing.save();
    console.log(`Existing account for ${phone} promoted to admin.`);
  } else {
    await User.create({ name, phone, passwordHash, role: "admin" });
    console.log(`Admin account created for ${phone}.`);
  }

  await mongoose.disconnect();
  console.log("Done. Log in on the storefront with this phone number and password.");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
