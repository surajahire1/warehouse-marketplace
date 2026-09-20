import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Booking } from '../../../core/models/booking.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ReviewModalComponent } from '../../../shared/components/review-modal/review-modal.component';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, ReviewModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Storage Reservations</h1>
          <p class="text-sm text-gray-500 mt-1">Track active, upcoming, and past warehouse bookings with Escrow protection.</p>
        </div>
        <a routerLink="/warehouses" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-sm">
          + Book More Space
        </a>
      </div>

      @if (loading()) {
        <div class="py-20 text-center text-gray-500">Loading your bookings...</div>
      } @else if (bookings().length === 0) {
        <div class="py-20 text-center bg-white rounded-xl border border-gray-200">
          <p class="text-gray-500 font-medium">You don't have any bookings yet.</p>
          <a routerLink="/warehouses" class="mt-4 inline-block text-sm text-indigo-600 font-semibold hover:underline">
            Explore Available Warehouses
          </a>
        </div>
      } @else {
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th class="px-6 py-4">Facility</th>
                  <th class="px-6 py-4">Reserved Dates</th>
                  <th class="px-6 py-4">Capacity</th>
                  <th class="px-6 py-4">Amount</th>
                  <th class="px-6 py-4">Reservation</th>
                  <th class="px-6 py-4">Escrow Status</th>
                  <th class="px-6 py-4 text-center">Review</th>
                  <th class="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (booking of bookings(); track booking._id) {
                  <tr class="hover:bg-gray-50/60 transition">
                    <td class="px-6 py-4 font-semibold text-gray-900">
                      <div>{{ getWarehouseTitle(booking.warehouseId) }}</div>
                      <div class="text-xs font-normal text-gray-500">{{ getWarehouseCity(booking.warehouseId) }}</div>
                    </td>
                    <td class="px-6 py-4 text-gray-600 text-xs">
                      {{ booking.startDate | date:'mediumDate' }} → {{ booking.endDate | date:'mediumDate' }}
                    </td>
                    <td class="px-6 py-4 font-medium text-gray-800">
                      {{ booking.quantityBooked }} {{ getCapacityUnit(booking.warehouseId) }}
                    </td>
                    <td class="px-6 py-4 font-bold text-gray-900">
                      {{ booking.currency === 'USD' ? '$' : '₹' }}{{ booking.totalAmount.toLocaleString() }}
                    </td>
                    <td class="px-6 py-4">
                      <app-status-badge [status]="booking.status" />
                    </td>
                    <td class="px-6 py-4">
                      @if (booking.paymentStatus === 'HELD_IN_ESCROW') {
                        <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          🛡️ Paid in Escrow
                        </span>
                      } @else if (booking.paymentStatus === 'DISBURSED') {
                        <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          💰 Disbursed
                        </span>
                      } @else if (booking.paymentStatus === 'REFUNDED') {
                        <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          ↩️ Refunded
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          ⏳ Unpaid
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if (isReviewable(booking)) {
                        @if (hasReviewed(booking._id)) {
                          <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Reviewed
                          </span>
                        } @else {
                          <button
                            type="button"
                            (click)="openReviewModal(booking)"
                            class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition inline-flex items-center gap-1 hover:scale-105 active:scale-95"
                          >
                            ⭐ Review
                          </button>
                        }
                      } @else {
                        <span class="text-[11px] text-gray-400 italic">Post-confirmation</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-right">
                      @if (booking.paymentId || booking.paymentStatus === 'HELD_IN_ESCROW' || booking.paymentStatus === 'DISBURSED') {
                        <button 
                          type="button" 
                          (click)="openReceipt(booking)"
                          class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition shadow-sm inline-flex items-center gap-1"
                        >
                          🧾 Receipt
                        </button>
                      } @else {
                        <span class="text-xs text-gray-400 italic">No receipt</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Receipt Modal Dialog -->
      @if (selectedBooking()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <!-- Receipt Header -->
            <div class="bg-gray-900 text-white p-6 flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-widest text-indigo-400">WarehouseSpace</span>
                  <span class="text-xs bg-indigo-600/40 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">Official Receipt</span>
                </div>
                <h3 class="text-lg font-bold mt-1 text-white">Payment & Escrow Confirmation</h3>
                <p class="text-xs text-gray-400 mt-0.5">Booking Ref: {{ selectedBooking()!._id }}</p>
              </div>
              <button 
                type="button" 
                (click)="closeReceipt()" 
                class="text-gray-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-gray-800 transition"
              >
                ✕
              </button>
            </div>

            <!-- Receipt Body -->
            <div class="p-6 overflow-y-auto space-y-5">
              
              <!-- Escrow Status Card -->
              <div class="p-4 rounded-xl border" [ngClass]="{
                'bg-emerald-50 border-emerald-200 text-emerald-900': selectedBooking()!.paymentStatus === 'HELD_IN_ESCROW',
                'bg-blue-50 border-blue-200 text-blue-900': selectedBooking()!.paymentStatus === 'DISBURSED',
                'bg-rose-50 border-rose-200 text-rose-900': selectedBooking()!.paymentStatus === 'REFUNDED',
                'bg-amber-50 border-amber-200 text-amber-900': selectedBooking()!.paymentStatus === 'UNPAID'
              }">
                <div class="flex items-center gap-2">
                  <span class="text-base">🛡️</span>
                  <div class="font-bold text-xs uppercase tracking-wider">
                    @if (selectedBooking()!.paymentStatus === 'HELD_IN_ESCROW') {
                      Protected in WarehouseSpace Escrow
                    } @else if (selectedBooking()!.paymentStatus === 'DISBURSED') {
                      Disbursed to Warehouse Host
                    } @else if (selectedBooking()!.paymentStatus === 'REFUNDED') {
                      Refunded to Customer
                    } @else {
                      Payment Pending
                    }
                  </div>
                </div>
                <p class="text-xs mt-1 text-gray-600">
                  @if (selectedBooking()!.paymentStatus === 'HELD_IN_ESCROW') {
                    Funds are secured and will not be transferred to the host until your warehouse reservation is confirmed and goods intake begins.
                  } @else if (selectedBooking()!.paymentStatus === 'DISBURSED') {
                    Booking completed. Host payout has been disbursed successfully.
                  } @else if (selectedBooking()!.paymentStatus === 'REFUNDED') {
                    Booking cancelled. Full refund has been initiated to your original payment method.
                  }
                </p>
              </div>

              <!-- Details Summary Table -->
              <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5 text-xs">
                <div class="flex justify-between pb-2 border-b border-gray-200">
                  <span class="text-gray-500 font-medium">Facility</span>
                  <span class="font-bold text-gray-900 text-right">{{ getWarehouseTitle(selectedBooking()!.warehouseId) }}</span>
                </div>
                <div class="flex justify-between pb-2 border-b border-gray-200">
                  <span class="text-gray-500 font-medium">Location</span>
                  <span class="font-semibold text-gray-800">{{ getWarehouseCity(selectedBooking()!.warehouseId) }}</span>
                </div>
                <div class="flex justify-between pb-2 border-b border-gray-200">
                  <span class="text-gray-500 font-medium">Reserved Dates</span>
                  <span class="font-semibold text-gray-800">
                    {{ selectedBooking()!.startDate | date:'mediumDate' }} → {{ selectedBooking()!.endDate | date:'mediumDate' }}
                  </span>
                </div>
                <div class="flex justify-between pb-2 border-b border-gray-200">
                  <span class="text-gray-500 font-medium">Capacity Booked</span>
                  <span class="font-semibold text-gray-800">
                    {{ selectedBooking()!.quantityBooked }} {{ getCapacityUnit(selectedBooking()!.warehouseId) }}
                  </span>
                </div>
                <div class="flex justify-between pb-2 border-b border-gray-200">
                  <span class="text-gray-500 font-medium">Payment ID</span>
                  <span class="font-mono text-[11px] text-gray-700">{{ selectedBooking()!.paymentId || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 font-medium">Order Reference</span>
                  <span class="font-mono text-[11px] text-gray-700">{{ selectedBooking()!.orderId || 'N/A' }}</span>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="border-t border-gray-100 pt-4 space-y-2 text-xs">
                <div class="flex justify-between text-gray-600">
                  <span>Storage Subtotal</span>
                  <span class="font-semibold">
                    {{ selectedBooking()!.currency === 'USD' ? '$' : '₹' }}{{ selectedBooking()!.totalAmount.toLocaleString() }}
                  </span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Escrow Guarantee Fee</span>
                  <span class="font-semibold text-emerald-600">FREE</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-gray-900">
                  <span>Total Amount Paid</span>
                  <span class="text-base text-indigo-600">
                    {{ selectedBooking()!.currency === 'USD' ? '$' : '₹' }}{{ selectedBooking()!.totalAmount.toLocaleString() }}
                  </span>
                </div>
              </div>

              <p class="text-[11px] text-gray-400 text-center">
                Payment verified securely via Razorpay Payment Gateway.
              </p>
            </div>

            <!-- Receipt Actions -->
            <div class="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button" 
                (click)="printReceipt()" 
                class="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition"
              >
                🖨️ Print
              </button>
              <button 
                type="button" 
                (click)="closeReceipt()" 
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      }

      <!-- Review Modal Dialog -->
      <app-review-modal
        [isOpen]="reviewModalOpen()"
        [bookingId]="reviewBookingId()"
        [warehouseTitle]="reviewWarehouseTitle()"
        [warehouseId]="reviewWarehouseId()"
        (close)="closeReviewModal()"
        (reviewSubmitted)="onReviewSubmitted($event)"
      />
    </div>
  `,
})
export class MyBookingsComponent implements OnInit {
  private http = inject(HttpClient);
  private reviewService = inject(ReviewService);

  bookings = signal<Booking[]>([]);
  loading = signal<boolean>(true);
  selectedBooking = signal<Booking | null>(null);

  reviewedBookingIds = signal<Set<string>>(new Set());
  reviewModalOpen = signal<boolean>(false);
  reviewBookingId = signal<string>('');
  reviewWarehouseTitle = signal<string>('');
  reviewWarehouseId = signal<string>('');

  ngOnInit() {
    this.fetchBookings();
    this.fetchMyReviews();
  }

  fetchBookings() {
    this.http.get<ApiResponse<Booking[]>>(`${environment.apiUrl}/bookings/my-bookings`).subscribe({
      next: (res) => {
        this.bookings.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.bookings.set([]);
        this.loading.set(false);
      },
    });
  }

  fetchMyReviews() {
    this.reviewService.getMyReviews().subscribe({
      next: (res) => {
        if (res.data) {
          const ids = new Set<string>();
          for (const rev of res.data) {
            const bId = typeof rev.bookingId === 'object' && rev.bookingId ? (rev.bookingId as any)._id : rev.bookingId;
            if (bId) ids.add(bId.toString());
          }
          this.reviewedBookingIds.set(ids);
        }
      },
      error: (err) => {
        console.error('Failed to load user reviews', err);
      },
    });
  }

  isReviewable(booking: Booking): boolean {
    return ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(booking.status);
  }

  hasReviewed(bookingId: string): boolean {
    return this.reviewedBookingIds().has(bookingId);
  }

  openReviewModal(booking: Booking) {
    const whId = typeof booking.warehouseId === 'object' && booking.warehouseId ? (booking.warehouseId as any)._id : booking.warehouseId;
    this.reviewBookingId.set(booking._id);
    this.reviewWarehouseId.set(whId || '');
    this.reviewWarehouseTitle.set(this.getWarehouseTitle(booking.warehouseId));
    this.reviewModalOpen.set(true);
  }

  closeReviewModal() {
    this.reviewModalOpen.set(false);
  }

  onReviewSubmitted(review: any) {
    const updated = new Set(this.reviewedBookingIds());
    if (this.reviewBookingId()) {
      updated.add(this.reviewBookingId());
      this.reviewedBookingIds.set(updated);
    }
    this.closeReviewModal();
  }

  getWarehouseTitle(warehouse: any): string {
    if (typeof warehouse === 'object' && warehouse?.title) {
      return warehouse.title;
    }
    return 'Warehouse Space';
  }

  getWarehouseCity(warehouse: any): string {
    if (typeof warehouse === 'object' && warehouse?.address?.city) {
      return `${warehouse.address.city}, ${warehouse.address.state || ''}`;
    }
    return '';
  }

  getCapacityUnit(warehouse: any): string {
    if (typeof warehouse === 'object' && warehouse?.capacityUnit) {
      return warehouse.capacityUnit;
    }
    return 'SQFT';
  }

  openReceipt(booking: Booking) {
    this.selectedBooking.set(booking);
  }

  closeReceipt() {
    this.selectedBooking.set(null);
  }

  printReceipt() {
    window.print();
  }
}
