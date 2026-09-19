import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.userRole();

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    // Role unauthorized -> redirect to home
    return router.createUrlTree(['/']);
  };
};
