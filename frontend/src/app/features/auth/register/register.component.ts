import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p class="text-sm text-gray-500 mt-1">Join WareSpace as a Customer or Warehouse Host</p>
        </div>

        @if (errorMessage()) {
          <div class="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {{ errorMessage() }}
          </div>
        }

        <!-- Role Toggle Selector -->
        <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
          <button 
            type="button" 
            (click)="role = 'CUSTOMER'"
            [ngClass]="role === 'CUSTOMER' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-gray-600 font-medium'"
            class="py-2 text-xs rounded-lg transition"
          >
            I Need Storage
          </button>
          <button 
            type="button" 
            (click)="role = 'MANAGER'"
            [ngClass]="role === 'MANAGER' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-gray-600 font-medium'"
            class="py-2 text-xs rounded-lg transition"
          >
            I Own a Warehouse
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700">Full Name / Business Name</label>
            <input 
              type="text" 
              [(ngModel)]="name" 
              name="name"
              required 
              class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

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
              minlength="6"
              required 
              class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {{ loading() ? 'Creating Account...' : 'Register as ' + (role === 'MANAGER' ? 'Host' : 'Customer') }}
          </button>
        </form>

        <p class="text-center text-xs text-gray-500">
          Already have an account? 
          <a routerLink="/auth/login" class="text-indigo-600 font-semibold hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  role: 'CUSTOMER' | 'MANAGER' = 'CUSTOMER';
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService
      .register({ name: this.name, email: this.email, password: this.password, role: this.role })
      .subscribe({
        next: () => {
          this.loading.set(false);
          if (this.role === 'MANAGER') {
            this.router.navigate(['/manager/dashboard']);
          } else {
            this.router.navigate(['/warehouses']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Registration failed');
        },
      });
  }
}
