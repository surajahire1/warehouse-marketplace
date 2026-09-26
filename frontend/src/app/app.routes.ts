import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { WarehouseListComponent } from './features/public/warehouse-list/warehouse-list.component';
import { WarehouseDetailComponent } from './features/public/warehouse-detail/warehouse-detail.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { MyBookingsComponent } from './features/customer/my-bookings/my-bookings.component';
import { MyInquiriesComponent } from './features/customer/my-inquiries/my-inquiries.component';
import { ManagerDashboardComponent } from './features/manager/dashboard/dashboard.component';
import { WarehouseEditorComponent } from './features/manager/warehouse-editor/warehouse-editor.component';
import { VerificationsComponent } from './features/admin/verifications/verifications.component';
import { UsersComponent } from './features/admin/users/users.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public Routes
  { path: '', component: HomeComponent },
  { path: 'warehouses', component: WarehouseListComponent },
  { path: 'warehouses/:id', component: WarehouseDetailComponent },

  // Auth Routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // Profile Route (Available to all logged-in users)
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },

  // Customer Routes
  {
    path: 'my-bookings',
    component: MyBookingsComponent,
    canActivate: [authGuard, roleGuard(['CUSTOMER', 'ADMIN'])],
  },
  {
    path: 'my-inquiries',
    component: MyInquiriesComponent,
    canActivate: [authGuard, roleGuard(['CUSTOMER', 'ADMIN'])],
  },

  // Manager Routes
  {
    path: 'manager/dashboard',
    component: ManagerDashboardComponent,
    canActivate: [authGuard, roleGuard(['MANAGER', 'ADMIN'])],
  },
  {
    path: 'manager/warehouses/new',
    component: WarehouseEditorComponent,
    canActivate: [authGuard, roleGuard(['MANAGER', 'ADMIN'])],
  },
  {
    path: 'manager/warehouses/:id/edit',
    component: WarehouseEditorComponent,
    canActivate: [authGuard, roleGuard(['MANAGER', 'ADMIN'])],
  },

  // Admin Routes
  {
    path: 'admin/verifications',
    component: VerificationsComponent,
    canActivate: [authGuard, roleGuard(['ADMIN'])],
  },
  {
    path: 'admin/users',
    component: UsersComponent,
    canActivate: [authGuard, roleGuard(['ADMIN', 'MANAGER'])],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
