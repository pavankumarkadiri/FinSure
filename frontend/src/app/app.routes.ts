import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { CustomerDashboardComponent } from './features/customer/customer-dashboard.component';
import { CustomerProfileComponent } from './features/customer/customer-profile.component';
import { OfficerDashboardComponent } from './features/officer/officer-dashboard.component';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'customer',
    component: CustomerDashboardComponent,
    canActivate: [authGuard, roleGuard(['CUSTOMER'])]
  },
  {
    path: 'customer/profile',
    component: CustomerProfileComponent,
    canActivate: [authGuard, roleGuard(['CUSTOMER'])]
  },
  {
    path: 'officer',
    component: OfficerDashboardComponent,
    canActivate: [authGuard, roleGuard(['OFFICER'])]
  },
  { path: '**', redirectTo: 'login' }
];
