import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { UserRole } from '../models/auth.models';

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.isAuthenticated()) {
    return true;
  }

  void router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isAuthenticated()) {
    return true;
  }

  const target = session.role() === 'OFFICER' ? '/officer' : '/customer';
  void router.navigate([target]);
  return false;
};

export function roleGuard(roles: UserRole[]): CanActivateFn {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);

    if (session.isAuthenticated() && session.role() && roles.includes(session.role() as UserRole)) {
      return true;
    }

    const target = session.role() === 'OFFICER' ? '/officer' : '/customer';
    void router.navigate([session.isAuthenticated() ? target : '/login']);
    return false;
  };
}
