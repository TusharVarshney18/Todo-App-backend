const bcrypt = require("bcrypt");

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

async function hashPassword(password) {
  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Invalid password");
  }
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(password, salt);
}

function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hashPassword, comparePassword };
