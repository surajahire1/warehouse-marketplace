import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p class="text-sm text-gray-500 mt-1">Manage your personal profile, contact information, and security.</p>
        </div>
        <div class="flex items-center gap-2">
          <span 
            class="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
            [ngClass]="{
              'bg-blue-100 text-blue-800': authService.userRole() === 'CUSTOMER',
              'bg-purple-100 text-purple-800': authService.userRole() === 'MANAGER',
              'bg-emerald-100 text-emerald-800': authService.userRole() === 'ADMIN'
            }"
          >
            {{ authService.userRole() === 'MANAGER' ? 'WAREHOUSE HOST' : authService.userRole() }}
          </span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-gray-200 gap-2">
        <button 
          type="button" 
          (click)="setTab('details')" 
          class="pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2"
          [ngClass]="activeTab() === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profile Details</span>
        </button>

        <button 
          type="button" 
          (click)="setTab('password')" 
          class="pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2"
          [ngClass]="activeTab() === 'password' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Change Password</span>
        </button>
      </div>

      <!-- TAB 1: Profile Details -->
      @if (activeTab() === 'details') {
        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <!-- User Overview Card -->
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold uppercase shadow-sm">
              {{ (name || authService.currentUser()?.email || 'U').charAt(0) }}
            </div>
            <div>
              <h2 class="text-base font-bold text-gray-900">{{ name || authService.currentUser()?.email }}</h2>
              <p class="text-xs text-gray-500">{{ authService.currentUser()?.email }}</p>
              <p class="text-[11px] text-gray-400 mt-0.5">
                Member since: {{ authService.currentUser()?.createdAt | date:'mediumDate' }}
              </p>
            </div>
          </div>

          @if (profileSuccess()) {
            <div class="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ profileSuccess() }}</span>
            </div>
          }

          @if (profileError()) {
            <div class="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {{ profileError() }}
            </div>
          }

          <form (ngSubmit)="onUpdateProfile()" class="space-y-5">
            <!-- Full Name -->
            <div>
              <label class="block text-xs font-semibold text-gray-700">Full Name</label>
              <input 
                type="text" 
                [(ngModel)]="name" 
                name="name" 
                placeholder="Enter your full name" 
                class="w-full mt-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <!-- Email Address (Read-only) -->
            <div>
              <label class="block text-xs font-semibold text-gray-700">Email Address</label>
              <div class="relative mt-1.5">
                <input 
                  type="email" 
                  [value]="authService.currentUser()?.email" 
                  disabled 
                  class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
                <span class="absolute right-3.5 top-3 text-xs text-gray-400 font-medium">Locked</span>
              </div>
              <p class="text-[11px] text-gray-400 mt-1">Email is your unique login credential and cannot be edited.</p>
            </div>

            <!-- Mobile Number with Separate Country Code -->
            <div>
              <label class="block text-xs font-semibold text-gray-700">Mobile / WhatsApp Number</label>
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

                <!-- National Phone Input -->
                <input 
                  type="tel" 
                  [(ngModel)]="phoneBody" 
                  name="phoneBody" 
                  placeholder="98200 12345" 
                  class="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <p class="text-[11px] text-gray-400 mt-1">Used by warehouse hosts and logistics teams to contact you for booking schedules.</p>
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-xs font-semibold text-gray-700">Date of Birth</label>
              <input 
                type="date" 
                [(ngModel)]="dob" 
                name="dob" 
                class="w-full mt-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700"
              />
              <p class="text-[11px] text-gray-400 mt-1">Your birth date for profile verification.</p>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button 
                type="submit" 
                [disabled]="profileLoading()"
                class="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {{ profileLoading() ? 'Saving Profile...' : 'Save Profile Details' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- TAB 2: Change Password -->
      @if (activeTab() === 'password') {
        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm max-w-xl space-y-6">
          <div>
            <h2 class="text-base font-bold text-gray-900">Change Your Password</h2>
            <p class="text-xs text-gray-500 mt-0.5">Enter your current password followed by your desired new password.</p>
          </div>

          @if (passwordSuccess()) {
            <div class="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ passwordSuccess() }}</span>
            </div>
          }

          @if (passwordError()) {
            <div class="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {{ passwordError() }}
            </div>
          }

          <form (ngSubmit)="onChangePassword()" class="space-y-4">
            <!-- Current Password -->
            <div>
              <label class="block text-xs font-semibold text-gray-700">Current Password</label>
              <div class="relative mt-1.5">
                <input 
                  [type]="showCurrentPassword ? 'text' : 'password'" 
                  [(ngModel)]="currentPassword" 
                  name="currentPassword" 
                  required 
                  placeholder="Enter current password" 
                  class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-12"
                />
                <button 
                  type="button" 
                  (click)="showCurrentPassword = !showCurrentPassword" 
                  class="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600 font-semibold"
                >
                  {{ showCurrentPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-xs font-semibold text-gray-700">New Password</label>
              <div class="relative mt-1.5">
                <input 
                  [type]="showNewPassword ? 'text' : 'password'" 
                  [(ngModel)]="newPassword" 
                  name="newPassword" 
                  minlength="6" 
                  required 
                  placeholder="Minimum 6 characters" 
                  class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-12"
                />
                <button 
                  type="button" 
                  (click)="showNewPassword = !showNewPassword" 
                  class="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600 font-semibold"
                >
                  {{ showNewPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label class="block text-xs font-semibold text-gray-700">Confirm New Password</label>
              <input 
                type="password" 
                [(ngModel)]="confirmPassword" 
                name="confirmPassword" 
                minlength="6" 
                required 
                placeholder="Re-type new password" 
                class="w-full mt-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button 
                type="submit" 
                [disabled]="passwordLoading()"
                class="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {{ passwordLoading() ? 'Updating Password...' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = signal<'details' | 'password'>('details');

  name = '';
  countryCode = '+91';
  phoneBody = '';
  dob = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  showCurrentPassword = false;
  showNewPassword = false;

  profileLoading = signal(false);
  profileSuccess = signal('');
  profileError = signal('');

  passwordLoading = signal(false);
  passwordSuccess = signal('');
  passwordError = signal('');

  ngOnInit() {
    // Listen for ?tab= query parameter
    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'password') {
        this.activeTab.set('password');
      } else {
        this.activeTab.set('details');
      }
    });

    this.populateUserDetails();
  }

  setTab(tab: 'details' | 'password') {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  private populateUserDetails() {
    const user = this.authService.currentUser();
    if (user) {
      this.name = user.name || '';

      // Parse existing phone number (e.g., "+91 9820012345" or "+919820012345")
      if (user.phone) {
        const trimmed = user.phone.trim();
        const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
        if (match) {
          this.countryCode = match[1];
          this.phoneBody = match[2];
        } else {
          this.phoneBody = trimmed;
        }
      }

      // Format Date of Birth for input[type="date"] (YYYY-MM-DD)
      if (user.dob) {
        const d = new Date(user.dob);
        if (!isNaN(d.getTime())) {
          this.dob = d.toISOString().split('T')[0];
        }
      }
    }
  }

  onUpdateProfile() {
    this.profileError.set('');
    this.profileSuccess.set('');

    const fullPhone = this.phoneBody.trim() ? `${this.countryCode} ${this.phoneBody.trim()}` : '';

    this.profileLoading.set(true);

    this.authService
      .updateProfile({
        name: this.name.trim(),
        phone: fullPhone,
        dob: this.dob || undefined,
      })
      .subscribe({
        next: () => {
          this.profileLoading.set(false);
          this.profileSuccess.set('Profile details updated successfully!');
          setTimeout(() => this.profileSuccess.set(''), 4000);
        },
        error: (err) => {
          this.profileLoading.set(false);
          this.profileError.set(err.error?.message || 'Failed to update profile.');
        },
      });
  }

  onChangePassword() {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('New password and confirm password do not match.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError.set('New password must be at least 6 characters.');
      return;
    }

    if (this.newPassword === this.currentPassword) {
      this.passwordError.set('New password must be different from current password.');
      return;
    }

    this.passwordLoading.set(true);

    this.authService
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (res) => {
          this.passwordLoading.set(false);
          this.passwordSuccess.set(res.message || 'Password changed successfully!');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          setTimeout(() => this.passwordSuccess.set(''), 4000);
        },
        error: (err) => {
          this.passwordLoading.set(false);
          this.passwordError.set(err.error?.message || 'Failed to change password.');
        },
      });
  }
}
