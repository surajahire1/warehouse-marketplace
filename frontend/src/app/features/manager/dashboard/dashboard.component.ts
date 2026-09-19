import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { Warehouse } from '../../../core/models/warehouse.model';
import { Booking, BookingStatus } from '../../../core/models/booking.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CapacityGaugeComponent } from '../../../shared/components/capacity-gauge/capacity-gauge.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CapacityGaugeComponent, StatusBadgeComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Host Management Dashboard</h1>
          <p class="text-sm text-gray-500 mt-1">Manage physical facilities, incoming customer reservations, and revenue.</p>
        </div>
        <div class="flex gap-3">
          <a 
            routerLink="/manager/warehouses/new" 
            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> List New Warehouse
          </a>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Facilities</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-gray-900">{{ warehouses().length }}</span>
            <span class="text-xs text-indigo-600 font-semibold">{{ approvedCount }} Live</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Requests</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-amber-600">{{ pendingBookingsCount }}</span>
            <span class="text-xs text-amber-700 font-semibold">Needs Approval</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmed Bookings</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-emerald-600">{{ confirmedBookingsCount }}</span>
            <span class="text-xs text-emerald-700 font-semibold">Active/Upcoming</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Booking Value</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-extrabold text-gray-900">₹{{ totalRevenue.toLocaleString() }}</span>
            <span class="text-xs text-emerald-600 font-semibold">₹{{ hostEarnings.toLocaleString() }} net</span>
          </div>
        </div>
      </div>

      <!-- Section 1: Incoming Customer Reservation Requests -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
        <div class="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/70">
          <div>
            <h2 class="font-bold text-base text-gray-900">Incoming Reservation Requests</h2>
            <p class="text-xs text-gray-500">Approve or decline customer storage bookings for your facilities</p>
          </div>

          <!-- Filter Tabs -->
          <div class="flex gap-2">
            <button 
              type="button" 
              (click)="bookingFilter = 'PENDING'"
              class="px-3 py-1 rounded-lg text-xs font-bold transition"
              [ngClass]="bookingFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              Pending Approval ({{ pendingBookingsCount }})
            </button>
            <button 
              type="button" 
              (click)="bookingFilter = 'CONFIRMED'"
              class="px-3 py-1 rounded-lg text-xs font-bold transition"
              [ngClass]="bookingFilter === 'CONFIRMED' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              Confirmed
            </button>
            <button 
              type="button" 
              (click)="bookingFilter = 'ALL'"
              class="px-3 py-1 rounded-lg text-xs font-bold transition"
              [ngClass]="bookingFilter === 'ALL' ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              All Requests
            </button>
          </div>
        </div>

        @if (loadingBookings()) {
          <div class="py-16 text-center text-xs text-gray-500">Loading incoming requests...</div>
        } @else if (filteredBookings.length === 0) {
          <div class="py-16 text-center">
            <p class="text-sm text-gray-500">No {{ bookingFilter === 'ALL' ? '' : bookingFilter.toLowerCase() }} reservation requests found.</p>
          </div>
        } @else {
          <div class="divide-y divide-gray-100">
            @for (booking of filteredBookings; track booking._id) {
              <div class="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-gray-50/50 transition">
                <div class="space-y-1.5 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="font-bold text-sm text-gray-900">{{ getWarehouseTitle(booking) }}</h3>
                    <app-status-badge [status]="booking.status" />
                    @if (booking.paymentStatus === 'HELD_IN_ESCROW') {
                      <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        🛡️ Paid in Escrow
                      </span>
                    } @else if (booking.paymentStatus === 'DISBURSED') {
                      <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        💰 Payout Disbursed
                      </span>
                    } @else if (booking.paymentStatus === 'REFUNDED') {
                      <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        ↩️ Refunded
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        ⏳ Payment Pending
                      </span>
                    }
                  </div>

                  <p class="text-xs text-gray-600">
                    Customer: <strong class="text-gray-900">{{ getCustomerName(booking) }}</strong> 
                    (<span class="text-indigo-600">{{ getCustomerEmail(booking) }}</span> • {{ getCustomerPhone(booking) }})
                  </p>

                  <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                    <span>Dates: <strong class="text-gray-800">{{ booking.startDate | date:'mediumDate' }} → {{ booking.endDate | date:'mediumDate' }}</strong></span>
                    <span>•</span>
                    <span>Space: <strong class="text-gray-900">{{ booking.quantityBooked }}</strong> {{ getCapacityUnit(booking) }}</span>
                    <span>•</span>
                    <span>Customer Paid: <strong class="text-gray-900 font-bold">{{ booking.currency === 'USD' ? '$' : '₹' }}{{ booking.totalAmount }}</strong></span>
                    <span>•</span>
                    <span>Host Net Payout: <strong class="text-emerald-700 font-bold text-sm">{{ booking.currency === 'USD' ? '$' : '₹' }}{{ booking.hostPayoutAmount || (booking.totalAmount * 0.9) }}</strong></span>
                  </div>
                </div>

                <!-- Approval Actions -->
                <div class="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                  @if (booking.status === 'PENDING') {
                    <button 
                      type="button" 
                      (click)="onUpdateBookingStatus(booking._id, 'CONFIRMED')"
                      [disabled]="updatingBookingId() === booking._id"
                      class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1"
                    >
                      <span>✓</span> Confirm Booking
                    </button>
                    <button 
                      type="button" 
                      (click)="onUpdateBookingStatus(booking._id, 'CANCELLED')"
                      [disabled]="updatingBookingId() === booking._id"
                      class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition border border-rose-200 disabled:opacity-50"
                    >
                      ✕ Decline
                    </button>
                  } @else if (booking.status === 'CONFIRMED') {
                    <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      ✓ Confirmed & Reserved
                    </span>
                  } @else if (booking.status === 'CANCELLED') {
                    <span class="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                      Declined / Cancelled
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Section 2: My Warehouse Listings -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 class="font-bold text-base text-gray-900">My Warehouse Listings</h2>
            <p class="text-xs text-gray-500">All storage spaces you have submitted to the platform</p>
          </div>
          <a routerLink="/manager/warehouses/new" class="text-xs font-semibold text-indigo-600 hover:underline">
            + Add Another Space
          </a>
        </div>

        @if (loadingWarehouses()) {
          <div class="py-16 text-center text-xs text-gray-500">Loading your facility listings...</div>
        } @else if (warehouses().length === 0) {
          <div class="py-16 text-center">
            <p class="text-sm text-gray-500">You haven't listed any warehouses yet.</p>
            <a 
              routerLink="/manager/warehouses/new" 
              class="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              List Your First Warehouse
            </a>
          </div>
        } @else {
          <div class="divide-y divide-gray-100">
            @for (item of warehouses(); track item._id) {
              <div class="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50/60 transition">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                    @if (item.images && item.images.length > 0) {
                      <img [src]="item.images[0]" class="w-full h-full object-cover" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Photo</div>
                    }
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-sm text-gray-900">{{ item.title }}</h3>
                      <!-- Verification status badge -->
                      <span 
                        class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800': item.verificationStatus === 'APPROVED',
                          'bg-amber-100 text-amber-800': item.verificationStatus === 'PENDING',
                          'bg-rose-100 text-rose-800': item.verificationStatus === 'REJECTED'
                        }"
                      >
                        {{ item.verificationStatus }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">📍 {{ item.address.city }}, {{ item.address.state }}</p>
                    <p class="text-xs text-gray-700 mt-1 font-medium">
                      {{ item.totalCapacity.toLocaleString() }} {{ item.capacityUnit }} • {{ item.currency === 'USD' ? '$' : '₹' }}{{ item.pricePerUnitPerDay }}/day
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                  <a 
                    [routerLink]="['/manager/warehouses', item._id, 'edit']" 
                    class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition border border-indigo-200"
                  >
                    ✏️ Edit Listing & Photos
                  </a>
                  <a 
                    [routerLink]="['/warehouses', item._id]" 
                    class="px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm"
                  >
                    View Public Page
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ManagerDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  authService = inject(AuthService);

  warehouses = signal<Warehouse[]>([]);
  bookings = signal<any[]>([]);
  loadingWarehouses = signal<boolean>(true);
  loadingBookings = signal<boolean>(true);
  updatingBookingId = signal<string | null>(null);

  bookingFilter: string = 'PENDING';

  ngOnInit() {
    this.fetchManagerWarehouses();
    this.fetchIncomingBookings();
  }

  get approvedCount(): number {
    return this.warehouses().filter((w) => w.verificationStatus === 'APPROVED').length;
  }

  get pendingBookingsCount(): number {
    return this.bookings().filter((b) => b.status === 'PENDING').length;
  }

  get confirmedBookingsCount(): number {
    return this.bookings().filter((b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE').length;
  }

  get totalRevenue(): number {
    return this.bookings()
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  }

  get hostEarnings(): number {
    return this.bookings()
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE')
      .reduce((sum, b) => sum + (b.hostPayoutAmount || Math.round((b.totalAmount || 0) * 0.9 * 100) / 100), 0);
  }

  get filteredBookings(): any[] {
    if (this.bookingFilter === 'ALL') {
      return this.bookings();
    }
    return this.bookings().filter((b) => b.status === this.bookingFilter);
  }

  fetchManagerWarehouses() {
    this.loadingWarehouses.set(true);
    this.http
      .get<ApiResponse<Warehouse[]>>(`${environment.apiUrl}/warehouses/manager/my-warehouses`)
      .subscribe({
        next: (res) => {
          this.warehouses.set(res.data || []);
          this.loadingWarehouses.set(false);
        },
        error: () => {
          this.warehouses.set([]);
          this.loadingWarehouses.set(false);
        },
      });
  }

  fetchIncomingBookings() {
    this.loadingBookings.set(true);
    this.http
      .get<ApiResponse<any[]>>(`${environment.apiUrl}/bookings/manager/incoming-requests`)
      .subscribe({
        next: (res) => {
          this.bookings.set(res.data || []);
          this.loadingBookings.set(false);
        },
        error: () => {
          this.bookings.set([]);
          this.loadingBookings.set(false);
        },
      });
  }

  onUpdateBookingStatus(bookingId: string, newStatus: 'CONFIRMED' | 'CANCELLED') {
    const actionName = newStatus === 'CONFIRMED' ? 'CONFIRM' : 'DECLINE';
    if (!confirm(`Are you sure you want to ${actionName} this reservation?`)) {
      return;
    }

    this.updatingBookingId.set(bookingId);

    this.http
      .patch<ApiResponse<any>>(`${environment.apiUrl}/bookings/${bookingId}/status`, {
        status: newStatus,
      })
      .subscribe({
        next: () => {
          this.updatingBookingId.set(null);
          alert(`Booking has been ${newStatus.toLowerCase()} successfully!`);
          this.fetchIncomingBookings();
        },
        error: (err) => {
          this.updatingBookingId.set(null);
          alert(err.error?.message || 'Failed to update booking status.');
        },
      });
  }

  getWarehouseTitle(b: any): string {
    return b.warehouseId?.title || 'Warehouse Facility';
  }

  getCustomerName(b: any): string {
    return b.customerId?.name || 'Customer';
  }

  getCustomerEmail(b: any): string {
    return b.customerId?.email || 'N/A';
  }

  getCustomerPhone(b: any): string {
    return b.customerId?.phone || 'No phone';
  }

  getCapacityUnit(b: any): string {
    return b.warehouseId?.capacityUnit || 'SQFT';
  }
}
