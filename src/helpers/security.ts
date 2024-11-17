import * as dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

dotenv.config();

const ALGORITHM = "aes-256-cbc"; // AES encryption algorithm
const key = process.env.ENCRYPTION_SECRET;
// key to a 32-byte key
const SECRET_KEY = crypto.createHash("sha256").update(key).digest();
// 16-byte IV as required
const IV = Buffer.from("0123456789abcdef0123456789abcdef", "hex");
const BYCRYPT_SALT = process.env.BYCRYPT_SALT;

export const hashAuthentication = async (password: string) => {
  const hashed = await bcryptjs.hash(password, Number(BYCRYPT_SALT));
  return hashed;
};

export const compareHashedPassword = async (
  password: string,
  hashedpassword: string
) => {
  const result = await bcryptjs.compare(password, hashedpassword);
  return result;
};

export const codeGenerator = () => {
  const length = new Uint32Array(1);
  return parseInt(crypto.getRandomValues(length).toString().substring(0, 6));
};

export const encrypt = (value: string): string => {
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, IV);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${IV.toString("hex")}:${encrypted}`;
};

export const decrypt = (str: string): string => {
  const [ivHex, encryptedText] = str.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
