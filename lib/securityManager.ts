"use client";

// ============================================
// Javed Security System
// PIN Lock, Auto-lock, Security Logs
// ============================================

const PIN_KEY = "javed_pin";
const LOCK_ENABLED_KEY = "javed_lock_enabled";
const SECURITY_LOG_KEY = "javed_security_log";
const AUTO_LOCK_TIME_KEY = "javed_auto_lock_minutes";
const LAST_ACTIVE_KEY = "javed_last_active";

export interface SecurityLogEntry {
  id: string;
  type: "unlock" | "lock" | "wrong_pin" | "setup" | "change";
  message: string;
  date: string;
}

// ============================================
// PIN Management
// ============================================

export function hasPIN(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(PIN_KEY);
}

export function setPIN(pin: string): boolean {
  if (typeof window === "undefined") return false;
  if (!/^\d{4}$/.test(pin)) return false;
  localStorage.setItem(PIN_KEY, pin);
  addSecurityLog("setup", "PIN সেট করা হয়েছে");
  return true;
}

export function verifyPIN(pin: string): boolean {
  if (typeof window === "undefined") return false;
  const savedPin = localStorage.getItem(PIN_KEY);
  if (savedPin === pin) {
    addSecurityLog("unlock", "সফলভাবে unlock হয়েছে");
    return true;
  }
  addSecurityLog("wrong_pin", "ভুল PIN দিয়ে চেষ্টা");
  return false;
}

export function changePIN(oldPin: string, newPin: string): boolean {
  if (verifyPIN(oldPin)) {
    if (/^\d{4}$/.test(newPin)) {
      localStorage.setItem(PIN_KEY, newPin);
      addSecurityLog("change", "PIN পরিবর্তন করা হয়েছে");
      return true;
    }
  }
  return false;
}

export function removePIN(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PIN_KEY);
  localStorage.removeItem(LOCK_ENABLED_KEY);
  addSecurityLog("change", "PIN সরিয়ে ফেলা হয়েছে");
}

// ============================================
// Lock Enabled
// ============================================

export function isLockEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOCK_ENABLED_KEY) === "true" && hasPIN();
}

export function setLockEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCK_ENABLED_KEY, enabled ? "true" : "false");
  addSecurityLog("change", enabled ? "Lock চালু করা হয়েছে" : "Lock বন্ধ করা হয়েছে");
}

// ============================================
// Auto Lock
// ============================================

export function getAutoLockMinutes(): number {
  if (typeof window === "undefined") return 5;
  const val = localStorage.getItem(AUTO_LOCK_TIME_KEY);
  return val ? parseInt(val) : 5;
}

export function setAutoLockMinutes(minutes: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTO_LOCK_TIME_KEY, minutes.toString());
  addSecurityLog("change", `Auto-lock ${minutes} মিনিটে সেট করা হয়েছে`);
}

export function updateLastActive(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

export function shouldAutoLock(): boolean {
  if (typeof window === "undefined") return false;
  if (!isLockEnabled()) return false;

  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
  if (!lastActive) return false;

  const minutes = getAutoLockMinutes();
  const elapsed = (Date.now() - parseInt(lastActive)) / 1000 / 60;
  return elapsed >= minutes;
}

// ============================================
// Security Log
// ============================================

export function addSecurityLog(
  type: SecurityLogEntry["type"],
  message: string
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = localStorage.getItem(SECURITY_LOG_KEY);
    let logs: SecurityLogEntry[] = existing ? JSON.parse(existing) : [];

    logs.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      type,
      message,
      date: new Date().toLocaleString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    // শেষ ৫০টা লগ রাখব
    if (logs.length > 50) {
      logs = logs.slice(-50);
    }

    localStorage.setItem(SECURITY_LOG_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error(e);
  }
}

export function getSecurityLogs(): SecurityLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = localStorage.getItem(SECURITY_LOG_KEY);
    if (!existing) return [];
    return JSON.parse(existing);
  } catch (e) {
    return [];
  }
}

export function clearSecurityLogs(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SECURITY_LOG_KEY);
}

// ============================================
// Security Status
// ============================================

export function getSecurityStatus() {
  return {
    hasPIN: hasPIN(),
    isLockEnabled: isLockEnabled(),
    autoLockMinutes: getAutoLockMinutes(),
    logCount: getSecurityLogs().length,
  };
}
