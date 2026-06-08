import prisma from '../config/database.js';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

export async function recordFailedAttempt(identifier: string): Promise<void> {
  const now = new Date();
  const record = await prisma.lockoutAttempt.findUnique({ where: { identifier } });

  if (record?.lockedUntil && now < record.lockedUntil) return;

  if (record) {
    const newAttempts = record.attempts + 1;
    const lockedUntil = newAttempts >= MAX_ATTEMPTS
      ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000)
      : null;

    await prisma.lockoutAttempt.update({
      where: { identifier },
      data: { attempts: newAttempts, lockedUntil, lastAttemptAt: now },
    });
  } else {
    await prisma.lockoutAttempt.create({
      data: {
        identifier,
        attempts: 1,
        lockedUntil: null,
        lastAttemptAt: now,
      },
    });
  }
}

export async function isLocked(identifier: string): Promise<boolean> {
  const record = await prisma.lockoutAttempt.findUnique({ where: { identifier } });
  if (!record) return false;
  if (record.lockedUntil && new Date() < record.lockedUntil) return true;
  if (record.lockedUntil && new Date() >= record.lockedUntil) {
    await prisma.lockoutAttempt.delete({ where: { identifier } });
    return false;
  }
  return false;
}

export async function clearAttempts(identifier: string): Promise<void> {
  await prisma.lockoutAttempt.delete({ where: { identifier } }).catch(() => {});
}

export async function getRemainingLockoutMinutes(identifier: string): Promise<number> {
  const record = await prisma.lockoutAttempt.findUnique({ where: { identifier } });
  if (!record?.lockedUntil) return 0;
  const remaining = Math.ceil((record.lockedUntil.getTime() - Date.now()) / 60000);
  return Math.max(0, remaining);
}
