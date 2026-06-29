import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

const ISSUER = 'SaaS Orchestrator';

export async function generateTotpSecret(email: string): Promise<{ secret: string; qrCode: string }> {
  const secret = generateSecret();
  const qrCode = await generateQrCode(email, secret);
  return { secret, qrCode };
}

export async function generateQrCode(email: string, secret: string): Promise<string> {
  const otpauthUri = generateURI({ secret, label: email, issuer: ISSUER });
  return QRCode.toDataURL(otpauthUri, { width: 240, margin: 1 });
}

export async function verifyTotp(secret: string, token: string): Promise<boolean> {
  try {
    const result = await verify({ token, secret });
    return result.valid;
  } catch {
    return false;
  }
}
