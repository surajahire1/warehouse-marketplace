import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900">Sign in to WareSpace</h2>
          <p class="text-sm text-gray-500 mt-1">Access your bookings or manage warehouse listings</p>
        </div>

        @if (errorMessage()) {
          <div class="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700">Email Address</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email"
              required 
              class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              required 
              class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="text-center text-xs text-gray-500">
          Don't have an account? 
          <a routerLink="/auth/register" class="text-indigo-600 font-semibold hover:underline">Register here</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.data.user.role === 'MANAGER') {
          this.router.navigate(['/manager/dashboard']);
        } else if (res.data.user.role === 'ADMIN') {
          this.router.navigate(['/admin/verifications']);
        } else {
          this.router.navigate(['/my-bookings']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Login failed. Please check your credentials.');
      },
    });
  }
}
