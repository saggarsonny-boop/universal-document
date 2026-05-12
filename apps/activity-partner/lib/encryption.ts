// AES-256-GCM encryption for emergency contact strings.
// Key: HAP_EMERGENCY_CONTACT_KEY — 64 hex chars (32 bytes). Set in Vercel env.
// Output format: base64(iv ‖ authTag ‖ ciphertext). 12-byte IV per RFC 5116.
//
// Decryption is only invoked from the moderator review path (Phase 5+);
// never from any read path the user themselves hits.

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const KEY_LEN = 32;

function getKey(): Buffer {
  const hex = process.env.HAP_EMERGENCY_CONTACT_KEY;
  if (!hex) {
    throw new Error("HAP_EMERGENCY_CONTACT_KEY is not set");
  }
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== KEY_LEN) {
    throw new Error(`HAP_EMERGENCY_CONTACT_KEY must be ${KEY_LEN * 2} hex chars`);
  }
  return buf;
}

export function encryptEmergencyContact(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptEmergencyContact(blob: string): string {
  const key = getKey();
  const buf = Buffer.from(blob, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + 16);
  const ct = buf.subarray(IV_LEN + 16);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}
