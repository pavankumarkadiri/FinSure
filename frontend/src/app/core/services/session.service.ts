import { Injectable, signal } from '@angular/core';
import { SessionState, UserRole } from '../models/auth.models';
import { decodeJwtSubject } from '../utils/jwt';

const STORAGE_KEY = 'finsure.session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly state = signal<SessionState | null>(this.loadStoredSession());

  readonly session = this.state.asReadonly();

  isAuthenticated(): boolean {
    return this.state() !== null;
  }

  token(): string | null {
    return this.state()?.token ?? null;
  }

  role(): UserRole | null {
    return this.state()?.role ?? null;
  }

  userId(): number | null {
    return this.state()?.userId ?? null;
  }

  email(): string | null {
    return this.state()?.email ?? null;
  }

  setSession(token: string, role: UserRole, userId: number | null): void {
    const email = decodeJwtSubject(token);

    if (!email) {
      throw new Error('Received an invalid JWT from the backend.');
    }

    const session: SessionState = { token, role, userId, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.state.set(session);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state.set(null);
  }

  private loadStoredSession(): SessionState | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SessionState;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
