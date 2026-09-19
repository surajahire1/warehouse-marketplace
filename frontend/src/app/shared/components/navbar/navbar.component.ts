import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>WareSpace</span>
        </a>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a routerLink="/warehouses" routerLinkActive="text-indigo-600 font-semibold" class="hover:text-gray-900 transition">Browse Warehouses</a>
          
          @if (authService.isCustomer()) {
            <a routerLink="/my-bookings" routerLinkActive="text-indigo-600 font-semibold" class="hover:text-gray-900 transition">My Bookings</a>
          }

          @if (authService.isManager()) {
            <a routerLink="/manager/dashboard" routerLinkActive="text-indigo-600 font-semibold" class="hover:text-gray-900 transition">Manager Dashboard</a>
          }

          @if (authService.isAdmin()) {
            <a routerLink="/admin/verifications" routerLinkActive="text-indigo-600 font-semibold" class="hover:text-gray-900 transition">Verifications</a>
            <a routerLink="/admin/users" routerLinkActive="text-indigo-600 font-semibold" class="hover:text-gray-900 transition">All Users</a>
          }
        </nav>

        <!-- User Actions -->
        <div class="flex items-center gap-3">
          @if (authService.isAuthenticated()) {
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase">
                {{ authService.userRole() }}
              </span>
              <span class="text-sm font-medium text-gray-800">{{ authService.currentUser()?.name }}</span>
              <button (click)="authService.logout()" class="text-sm font-medium text-gray-500 hover:text-red-600 transition">
                Logout
              </button>
            </div>
          } @else {
            <a routerLink="/auth/login" class="text-sm font-medium text-gray-700 hover:text-indigo-600 transition px-3 py-2">
              Sign In
            </a>
            <a routerLink="/auth/register" class="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
              Get Started
            </a>
          }
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  authService = inject(AuthService);
}
