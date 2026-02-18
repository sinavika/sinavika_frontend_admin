import { LOGIN_RATE_LIMIT } from "@/constants";

const { MAX_ATTEMPTS, LOCKOUT_MINUTES, STORAGE_KEY } = LOGIN_RATE_LIMIT;
const LOCKOUT_MS = LOCKOUT_MINUTES * 60 * 1000;

const getData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null };
    const data = JSON.parse(raw);
    return {
      attempts: data.attempts ?? 0,
      lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : null
    };
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
};

const setData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

/**
 * Giriş denemesi yapılabilir mi? Kilitleme varsa kalan süre (dakika) döner.
 * @returns {{ allowed: boolean, remainingMinutes?: number }}
 */
export const canAttemptLogin = () => {
  const { attempts, lockedUntil } = getData();
  if (lockedUntil && lockedUntil.getTime() > Date.now()) {
    const remainingMs = lockedUntil.getTime() - Date.now();
    return { allowed: false, remainingMinutes: Math.ceil(remainingMs / 60000) };
  }
  if (lockedUntil) {
    setData({ attempts: 0, lockedUntil: null });
  }
  return { allowed: true };
};

/**
 * Başarısız giriş denemesi kaydeder. Limit aşılırsa kilitleme uygular.
 */
export const recordFailedAttempt = () => {
  const { attempts, lockedUntil } = getData();
  if (lockedUntil && lockedUntil.getTime() > Date.now()) return;
  const next = attempts + 1;
  const lockedUntilTime =
    next >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;
  setData({
    attempts: next >= MAX_ATTEMPTS ? 0 : next,
    lockedUntil: lockedUntilTime ? lockedUntilTime.toISOString() : null
  });
};

/**
 * Başarılı girişte sayacı sıfırla.
 */
export const clearLoginAttempts = () => {
  setData({ attempts: 0, lockedUntil: null });
};
