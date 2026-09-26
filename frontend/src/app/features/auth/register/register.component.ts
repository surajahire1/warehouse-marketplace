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
          <p class="text-sm text-gray-500 mt-1">Sign up with your mobile number and email</p>
        </div>

        @if (errorMessage()) {
          <div class="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
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
          <!-- Email Address -->
          <div>
            <label class="block text-xs font-semibold text-gray-700">Email Address</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email"
              required 
              placeholder="name@example.com"
              class="w-full mt-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <!-- Mobile Number with Country Code -->
          <div>
            <label class="block text-xs font-semibold text-gray-700">Mobile Number</label>
            <div class="mt-1.5 flex gap-2">
              <!-- Country Code Selector -->
              <div class="w-32 shrink-0">
                <select 
                  [(ngModel)]="countryCode" 
                  name="countryCode"
                  class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="+91">🇮🇳 +91 (IN)</option>
                  <option value="+1">🇺🇸 +1 (US/CA)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                  <option value="+65">🇸🇬 +65 (SG)</option>
                  <option value="+61">🇦🇺 +61 (AU)</option>
                  <option value="+49">🇩🇪 +49 (DE)</option>
                  <option value="+33">🇫🇷 +33 (FR)</option>
                  <option value="+81">🇯🇵 +81 (JP)</option>
                </select>
              </div>

              <!-- National Mobile Input -->
              <input 
                type="tel" 
                [(ngModel)]="phoneNumber" 
                name="phoneNumber"
                required
                placeholder="98200 12345"
                class="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <p class="text-[11px] text-gray-400 mt-1">Used for instant SMS/WhatsApp booking alerts.</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              minlength="6" 
              required 
              placeholder="At least 6 characters"
              class="w-full mt-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50 mt-2"
          >
            {{ loading() ? 'Creating Account...' : 'Register as ' + (role === 'MANAGER' ? 'Warehouse Host' : 'Customer') }}
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

  email = '';
  countryCode = '+91';
  phoneNumber = '';
  password = '';
  role: 'CUSTOMER' | 'MANAGER' = 'CUSTOMER';
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  onSubmit() {
    this.errorMessage.set('');

    const cleanPhone = this.phoneNumber.trim();
    if (!cleanPhone) {
      this.errorMessage.set('Mobile phone number is required.');
      return;
    }

    const fullPhone = `${this.countryCode} ${cleanPhone}`;

    this.loading.set(true);

    this.authService
      .register({
        email: this.email.trim(),
        phone: fullPhone,
        password: this.password,
        role: this.role,
      })
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
