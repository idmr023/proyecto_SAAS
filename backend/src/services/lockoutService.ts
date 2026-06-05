interface LockoutRecord {
  attempts: number;
  lockedUntil: Date | null;
}

const store = new Map<string, LockoutRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;
const WINDOW_MINUTES = 15;

export function recordFailedAttempt(identifier: string): void {
  const now = new Date();
  const record = store.get(identifier) || { attempts: 0, lockedUntil: null };

  if (record.lockedUntil && now < record.lockedUntil) return;

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
  }

  store.set(identifier, record);

  setTimeout(() => store.delete(identifier), WINDOW_MINUTES * 60 * 1000);
}

export function isLocked(identifier: string): boolean {
  const record = store.get(identifier);
  if (!record) return false;
  if (record.lockedUntil && new Date() < record.lockedUntil) return true;
  if (record.lockedUntil && new Date() >= record.lockedUntil) {
    store.delete(identifier);
    return false;
  }
  return false;
}

export function clearAttempts(identifier: string): void {
  store.delete(identifier);
}

export function getRemainingLockoutMinutes(identifier: string): number {
  const record = store.get(identifier);
  if (!record?.lockedUntil) return 0;
  const remaining = Math.ceil((record.lockedUntil.getTime() - Date.now()) / 60000);
  return Math.max(0, remaining);
}
