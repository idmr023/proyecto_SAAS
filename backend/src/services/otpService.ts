import crypto from 'crypto';
import { env } from '../config/env.js';

interface OTPStore {
  [adminId: string]: {
    code: string;
    expiresAt: Date;
  };
}

const otpStore: OTPStore = {};

export function generateOTP(adminId: string): string {
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRATION_MINUTES * 60 * 1000);
  otpStore[adminId] = { code, expiresAt };
  return code;
}

export function verifyOTP(adminId: string, code: string): boolean {
  const record = otpStore[adminId];
  if (!record) return false;
  if (Date.now() > record.expiresAt.getTime()) {
    delete otpStore[adminId];
    return false;
  }
  const valid = record.code === code;
  if (valid) delete otpStore[adminId];
  return valid;
}
