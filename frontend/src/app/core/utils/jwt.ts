import { UserRole } from '../models/auth.models';

function decodeJwtPayload(token: string): { sub?: string; exp?: number; role?: string } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    return JSON.parse(atob(padded)) as { sub?: string; exp?: number; role?: string };
  } catch {
    return null;
  }
}

export function decodeJwtSubject(token: string): string | null {
  return decodeJwtPayload(token)?.sub ?? null;
}

export function decodeJwtRole(token: string): UserRole | null {
  const role = decodeJwtPayload(token)?.role;
  return role === 'CUSTOMER' || role === 'OFFICER' ? role : null;
}

export function isJwtExpired(token: string): boolean {
  const exp = decodeJwtPayload(token)?.exp;

  if (!exp) {
    return true;
  }

  return exp * 1000 <= Date.now();
}
