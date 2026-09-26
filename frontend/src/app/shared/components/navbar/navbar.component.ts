import { Component, OnInit, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InquiryService } from '../../../core/services/inquiry.service';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LanguageSelectorComponent],
  host: {
    class: 'sticky top-0 z-50 block w-full',
  },
  template: `
    <!-- Missing Phone Alert Banner for Authenticated Users -->
    @if (authService.isAuthenticated() && !authService.hasPhone()) {
      <aside aria-label="Profile notification" class="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-4 py-2 shadow-xs">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-center sm:text-left">
            <span class="text-sm">📱</span>
            <span class="font-medium">
              Complete your profile: Add your contact number so warehouse operators and shippers can reach you regarding bookings.
            </span>
          </div>
          <a 
            routerLink="/profile" 
            [queryParams]="{ tab: 'details' }"
            class="bg-white text-amber-900 font-bold px-3 py-1 rounded-md text-[11px] hover:bg-amber-50 transition shadow-xs shrink-0"
          >
            Add Phone Number &rarr;
          </a>
        </div>
      </aside>
    }

    <header class="bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
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
            <a routerLink="/my-inquiries" routerLinkActive="text-indigo-600 font-semibold" class="hover:text-gray-900 transition relative inline-flex items-center gap-1.5">
              <span>Messages</span>
              @if (inquiryService.unreadCustomerCount() > 0) {
                <span class="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black text-white bg-indigo-600 rounded-full animate-pulse shadow-xs">
                  {{ inquiryService.unreadCustomerCount() }}
                </span>
              }
            </a>
          }

          @if (authService.isManager()) {
            <a routerLink="/manager/dashboard" routerLinkActive="text-indigo-600 font-semibold" class="hover:text-gray-900 transition">Manager Dashboard</a>
          }

          @if (authService.isAdmin()) {
            <a routerLink="/admin/verifications" routerLinkActive="text-indigo-600 font-semibold" class="hover:text-gray-900 transition">Verifications</a>
            <a routerLink="/admin/users" routerLinkActive="text-indigo-600 font-semibold" class="hover:text-gray-900 transition">All Users</a>
          }
        </nav>

        <!-- User Actions & Language Switcher -->
        <div class="flex items-center gap-3">
          <!-- Mother Tongue Language Selector -->
          <app-language-selector />

          @if (authService.isAuthenticated()) {
            <!-- Profile Dropdown Container -->
            <div class="relative" #profileDropdown>
              <button 
                type="button" 
                (click)="toggleDropdown($event)"
                class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-haspopup="true"
                [attr.aria-expanded]="isDropdownOpen"
              >
                <!-- Avatar circle with initial -->
                <div class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
                  {{ (authService.currentUser()?.name || authService.currentUser()?.email || 'U').charAt(0) }}
                </div>
                <div class="flex flex-col text-left hidden sm:flex">
                  <span class="text-xs font-semibold text-gray-800 leading-tight">
                    {{ authService.currentUser()?.name || 'My Account' }}
                  </span>
                  <span class="text-[10px] text-gray-500 font-medium uppercase leading-tight">
                    {{ authService.userRole() }}
                  </span>
                </div>
                <!-- Chevron Down icon -->
                <svg class="w-3.5 h-3.5 text-gray-500 transition-transform duration-200" [ngClass]="{ 'rotate-180': isDropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              @if (isDropdownOpen) {
                <div 
                  class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                >
                  <!-- Account Summary Header -->
                  <div class="px-4 py-2.5 border-b border-gray-100">
                    <p class="text-xs font-bold text-gray-900 truncate">
                      {{ authService.currentUser()?.name || 'Account User' }}
                    </p>
                    <p class="text-[11px] text-gray-500 truncate">
                      {{ authService.currentUser()?.email }}
                    </p>
                    <span 
                      class="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                      [ngClass]="{
                        'bg-blue-50 text-blue-700': authService.userRole() === 'CUSTOMER',
                        'bg-purple-50 text-purple-700': authService.userRole() === 'MANAGER',
                        'bg-emerald-50 text-emerald-700': authService.userRole() === 'ADMIN'
                      }"
                    >
                      {{ authService.userRole() === 'MANAGER' ? 'HOST' : authService.userRole() }}
                    </span>
                  </div>

                  <!-- Menu Links -->
                  <div class="py-1">
                    <button 
                      type="button" 
                      (click)="goToTab('details')" 
                      class="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition"
                    >
                      <svg class="w-4 h-4 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span class="font-medium">Profile Details</span>
                    </button>

                    <button 
                      type="button" 
                      (click)="goToTab('password')" 
                      class="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition"
                    >
                      <svg class="w-4 h-4 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span class="font-medium">Change Password</span>
                    </button>
                  </div>

                  <!-- Divider -->
                  <div class="border-t border-gray-100 my-1"></div>

                  <!-- Sign Out -->
                  <div class="py-1">
                    <button 
                      type="button" 
                      (click)="onLogout()" 
                      class="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition font-medium"
                    >
                      <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="hidden sm:flex items-center gap-2">
              <a routerLink="/auth/login" class="text-sm font-medium text-gray-700 hover:text-indigo-600 transition px-3 py-2">
                Sign In
              </a>
              <a routerLink="/auth/register" class="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                Get Started
              </a>
            </div>
          }

          <!-- Mobile Hamburger Toggle Button (md:hidden) -->
          <button 
            type="button" 
            (click)="toggleMobileMenu($event)"
            class="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle navigation menu"
            [attr.aria-expanded]="isMobileMenuOpen"
          >
            @if (isMobileMenuOpen) {
              <!-- Close (X) icon -->
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else {
              <!-- Hamburger icon -->
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          </button>
        </div>
      </div>

      <!-- Collapsible Mobile Navigation Drawer (md:hidden) -->
      @if (isMobileMenuOpen) {
        <div class="md:hidden border-t border-gray-100 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav class="flex flex-col space-y-2 text-sm font-medium text-gray-700">
            <a 
              routerLink="/warehouses" 
              (click)="closeMobileMenu()" 
              routerLinkActive="text-indigo-600 bg-indigo-50/70 font-semibold" 
              class="px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <span>🏢</span>
              <span>Browse Warehouses</span>
            </a>

            @if (authService.isCustomer()) {
              <a 
                routerLink="/my-bookings" 
                (click)="closeMobileMenu()" 
                routerLinkActive="text-indigo-600 bg-indigo-50/70 font-semibold" 
                class="px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
              >
                <span class="flex items-center gap-2">
                  <span>📦</span>
                  <span>My Bookings</span>
                </span>
                <span class="text-xs text-gray-400">Escrow Protected</span>
              </a>

              <a 
                routerLink="/my-inquiries" 
                (click)="closeMobileMenu()" 
                routerLinkActive="text-indigo-600 bg-indigo-50/70 font-semibold" 
                class="px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
              >
                <span class="flex items-center gap-2">
                  <span>💬</span>
                  <span>Messages & Discussions</span>
                </span>
                @if (inquiryService.unreadCustomerCount() > 0) {
                  <span class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-black text-white bg-indigo-600 rounded-full animate-pulse shadow-xs">
                    {{ inquiryService.unreadCustomerCount() }} new
                  </span>
                }
              </a>
            }

            @if (authService.isManager()) {
              <a 
                routerLink="/manager/dashboard" 
                (click)="closeMobileMenu()" 
                routerLinkActive="text-indigo-600 bg-indigo-50/70 font-semibold" 
                class="px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <span>📊</span>
                <span>Manager Dashboard</span>
              </a>
              <a 
                routerLink="/manager/warehouses/new" 
                (click)="closeMobileMenu()" 
                class="px-3 py-2 rounded-lg text-indigo-600 hover:bg-indigo-50/70 transition flex items-center gap-2 font-semibold"
              >
                <span>➕</span>
                <span>List New Warehouse</span>
              </a>
            }

            @if (authService.isAdmin()) {
              <a 
                routerLink="/admin/verifications" 
                (click)="closeMobileMenu()" 
                routerLinkActive="text-indigo-600 bg-indigo-50/70 font-semibold" 
                class="px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <span>🛡️</span>
                <span>Facility Verifications</span>
              </a>
              <a 
                routerLink="/admin/users" 
                (click)="closeMobileMenu()" 
                routerLinkActive="text-indigo-600 bg-indigo-50/70 font-semibold" 
                class="px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <span>👥</span>
                <span>All Users</span>
              </a>
            }
          </nav>

          <!-- Mobile Auth Actions when logged out -->
          @if (!authService.isAuthenticated()) {
            <div class="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
              <a 
                routerLink="/auth/login" 
                (click)="closeMobileMenu()" 
                class="w-full text-center py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Sign In
              </a>
              <a 
                routerLink="/auth/register" 
                (click)="closeMobileMenu()" 
                class="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Get Started
              </a>
            </div>
          } @else {
            <!-- Mobile Account Shortcuts when logged in -->
            <div class="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1.5 text-xs">
              <button 
                type="button"
                (click)="goToTabFromMobile('details')"
                class="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2 font-medium"
              >
                <span>⚙️</span>
                <span>Profile Details & Phone</span>
              </button>
              <button 
                type="button"
                (click)="goToTabFromMobile('password')"
                class="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2 font-medium"
              >
                <span>🔑</span>
                <span>Change Password</span>
              </button>
              <button 
                type="button"
                (click)="onLogout()"
                class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-semibold"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          }
        </div>
      }
    </header>
  `,
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  inquiryService = inject(InquiryService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isDropdownOpen = false;
  isMobileMenuOpen = false;

  ngOnInit() {
    if (this.authService.isAuthenticated() && this.authService.isCustomer()) {
      this.inquiryService.refreshCustomerUnreadCount();
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(event: Event) {
    event.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isDropdownOpen = false;
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  goToTab(tab: 'details' | 'password') {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
    this.router.navigate(['/profile'], { queryParams: { tab } });
  }

  goToTabFromMobile(tab: 'details' | 'password') {
    this.closeMobileMenu();
    this.router.navigate(['/profile'], { queryParams: { tab } });
  }

  onLogout() {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.isMobileMenuOpen = false;
    }
  }
}
