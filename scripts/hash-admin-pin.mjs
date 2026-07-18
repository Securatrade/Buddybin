import bcrypt from "bcryptjs";

const pin = process.argv[2];

if (!pin) {
  console.error("Usage: npm run hash:admin-pin -- <pin>");
  process.exit(1);
}

if (pin.length < 4 || pin.length > 32) {
  console.error("PIN must be between 4 and 32 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(pin, 12);
console.log(hash);
