import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Warehouse, AvailabilityResult } from '../../../core/models/warehouse.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CapacityGaugeComponent } from '../../../shared/components/capacity-gauge/capacity-gauge.component';
import { InquiryDrawerComponent } from '../../../shared/components/inquiry-drawer/inquiry-drawer.component';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewService } from '../../../core/services/review.service';
import { WarehouseReviewsResponse } from '../../../core/models/review.model';

declare var window: any;

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CapacityGaugeComponent, InquiryDrawerComponent],
  template: `
    @if (loading()) {
      <div class="py-20 text-center text-gray-500">Loading facility details...</div>
    } @else if (warehouse()) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <div>
              <div class="flex flex-wrap items-center gap-3 mb-1">
                <span class="text-xs font-semibold uppercase text-indigo-600 tracking-wider">
                  {{ warehouse()!.capacityUnit }} Storage • {{ warehouse()!.currency }}
                </span>
                @if (warehouse()!.reviewCount && warehouse()!.reviewCount! > 0) {
                  <a href="#reviews-section" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs hover:bg-amber-100 transition cursor-pointer">
                    <span class="text-amber-500">★</span>
                    <span>{{ warehouse()!.averageRating }}</span>
                    <span class="text-amber-700 font-normal">({{ warehouse()!.reviewCount }} verified review{{ warehouse()!.reviewCount! > 1 ? 's' : '' }})</span>
                  </a>
                } @else {
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    ⭐ New Facility
                  </span>
                }
              </div>
              <h1 class="text-3xl font-extrabold text-gray-900 mt-1">{{ warehouse()!.title }}</h1>
              <p class="text-sm text-gray-500 mt-2">
                📍 {{ warehouse()!.address.street }}, {{ warehouse()!.address.city }}, {{ warehouse()!.address.state }} {{ warehouse()!.address.postalCode }}, {{ warehouse()!.address.country }}
              </p>
            </div>

            <!-- Image gallery -->
            <div class="h-80 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              @if (warehouse()!.images && warehouse()!.images.length > 0) {
                <img [src]="warehouse()!.images[0]" class="w-full h-full object-cover" />
              } @else {
                <div class="w-full h-full flex items-center justify-center text-gray-400">Warehouse Facility Photo</div>
              }
            </div>

            <div>
              <h2 class="text-lg font-bold text-gray-900 mb-2">About This Facility</h2>
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ warehouse()!.description }}</p>
            </div>

            <!-- Facility Specifications Overview -->
            <div>
              <h2 class="text-lg font-bold text-gray-900 mb-3">Facility Specifications</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div class="p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                  <span class="text-[11px] text-amber-800 font-semibold block uppercase tracking-wider">Min. Reservation</span>
                  <span class="text-base font-extrabold text-amber-950">⏱️ {{ warehouse()!.minBookingDays }} Day{{ warehouse()!.minBookingDays > 1 ? 's' : '' }}</span>
                </div>
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span class="text-[11px] text-gray-500 font-semibold block uppercase tracking-wider">Total Capacity</span>
                  <span class="text-base font-extrabold text-gray-900">{{ warehouse()!.totalCapacity.toLocaleString() }} {{ warehouse()!.capacityUnit }}</span>
                </div>
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span class="text-[11px] text-gray-500 font-semibold block uppercase tracking-wider">Daily Rate</span>
                  <span class="text-base font-extrabold text-gray-900">{{ warehouse()!.currency === 'USD' ? '$' : '₹' }}{{ warehouse()!.pricePerUnitPerDay }}/day</span>
                </div>
              </div>
            </div>

            <div>
              <h2 class="text-lg font-bold text-gray-900 mb-3">Facility Amenities</h2>
              <div class="flex flex-wrap gap-2">
                @for (amenity of warehouse()!.amenities; track amenity) {
                  <span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                    ✓ {{ amenity }}
                  </span>
                }
              </div>
            </div>

            <!-- Host Information & Direct Chat Card -->
            <div class="p-5 bg-gradient-to-r from-indigo-50/70 to-blue-50/50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {{ managerInitials }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-gray-900">
                      Hosted by {{ managerDisplayName }}
                    </h3>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                      ✓ Verified Host
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">
                    Commercial facility operator • Fast operational response
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="isInquiryDrawerOpen.set(true)"
                class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <span>💬</span>
                <span>Ask Host a Question</span>
              </button>
            </div>

            <!-- Verified Facility Reviews & Operational Breakdown Section -->
            <div id="reviews-section" class="pt-6 border-t border-gray-200 space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-xl font-bold text-gray-900">Verified Customer Reviews</h2>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                      ✓ Verified Shippers Only
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Operational ratings submitted by shippers who booked and stored cargo at this facility.
                  </p>
                </div>
              </div>

              @if (loadingReviews()) {
                <div class="py-10 text-center text-xs text-gray-400">Loading verified reviews...</div>
              } @else if (reviewsData() && reviewsData()!.summary.totalReviews > 0) {
                <!-- Operational Breakdown Summary Card -->
                <div class="bg-gray-50/80 rounded-2xl p-6 border border-gray-200/90 shadow-2xs">
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    <!-- Left: Overall Rating -->
                    <div class="md:col-span-4 text-center md:border-r md:border-gray-200 md:pr-6">
                      <div class="text-5xl font-black text-gray-900 tracking-tight">
                        {{ reviewsData()!.summary.averageRating.toFixed(1) }}
                      </div>
                      <div class="flex items-center justify-center gap-1 text-amber-400 text-xl my-1.5">
                        @for (s of [1, 2, 3, 4, 5]; track s) {
                          <span>{{ s <= round(reviewsData()!.summary.averageRating) ? '★' : '☆' }}</span>
                        }
                      </div>
                      <div class="text-xs font-semibold text-gray-600">
                        Based on {{ reviewsData()!.summary.totalReviews }} verified reservation{{ reviewsData()!.summary.totalReviews > 1 ? 's' : '' }}
                      </div>
                      <div class="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        🛡️ Escrow Verified
                      </div>
                    </div>

                    <!-- Middle: Category Scores -->
                    <div class="md:col-span-8 space-y-3">
                      <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Operational Performance Metrics
                      </h4>

                      <!-- Dock Speed -->
                      <div>
                        <div class="flex justify-between text-xs font-semibold mb-1">
                          <span class="text-gray-700 flex items-center gap-1">⚡ Dock Turnaround Speed</span>
                          <span class="text-gray-900">{{ reviewsData()!.summary.categories.dockSpeed.toFixed(1) }} / 5.0</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div class="bg-amber-500 h-2 rounded-full transition-all duration-500" [style.width.%]="(reviewsData()!.summary.categories.dockSpeed / 5) * 100"></div>
                        </div>
                      </div>

                      <!-- Security & CCTV -->
                      <div>
                        <div class="flex justify-between text-xs font-semibold mb-1">
                          <span class="text-gray-700 flex items-center gap-1">🛡️ Security & 24/7 Surveillance</span>
                          <span class="text-gray-900">{{ reviewsData()!.summary.categories.security.toFixed(1) }} / 5.0</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div class="bg-indigo-600 h-2 rounded-full transition-all duration-500" [style.width.%]="(reviewsData()!.summary.categories.security / 5) * 100"></div>
                        </div>
                      </div>

                      <!-- Cleanliness -->
                      <div>
                        <div class="flex justify-between text-xs font-semibold mb-1">
                          <span class="text-gray-700 flex items-center gap-1">🧹 Floor Loading & Cleanliness</span>
                          <span class="text-gray-900">{{ reviewsData()!.summary.categories.cleanliness.toFixed(1) }} / 5.0</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div class="bg-emerald-600 h-2 rounded-full transition-all duration-500" [style.width.%]="(reviewsData()!.summary.categories.cleanliness / 5) * 100"></div>
                        </div>
                      </div>

                      <!-- Host Responsiveness -->
                      <div>
                        <div class="flex justify-between text-xs font-semibold mb-1">
                          <span class="text-gray-700 flex items-center gap-1">🤝 Host Responsiveness & Support</span>
                          <span class="text-gray-900">{{ reviewsData()!.summary.categories.hostResponsiveness.toFixed(1) }} / 5.0</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" [style.width.%]="(reviewsData()!.summary.categories.hostResponsiveness / 5) * 100"></div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <!-- Individual Reviews Feed -->
                <div class="space-y-4">
                  @for (review of reviewsData()!.reviews; track review._id) {
                    <div class="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                            {{ getCustomerInitials(review.customerId) }}
                          </div>
                          <div>
                            <div class="flex items-center gap-2">
                              <span class="text-sm font-bold text-gray-900">{{ getCustomerName(review.customerId) }}</span>
                              <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                ✓ Verified Booking
                              </span>
                            </div>
                            <span class="text-[11px] text-gray-400">
                              Stored {{ review.facilityTypeUsed || 'Commercial Cargo' }} • Reviewed on {{ review.createdAt | date:'mediumDate' }}
                            </span>
                          </div>
                        </div>

                        <!-- Overall Stars -->
                        <div class="flex items-center gap-1 text-amber-400 text-sm font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <span>★</span>
                          <span class="text-amber-900">{{ review.overallRating }}.0</span>
                        </div>
                      </div>

                      <!-- Operational Pill Tags -->
                      <div class="flex flex-wrap gap-2 text-[11px]">
                        <span class="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                          ⚡ Dock: <strong>{{ review.dockSpeedRating }}★</strong>
                        </span>
                        <span class="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                          🛡️ Security: <strong>{{ review.securityRating }}★</strong>
                        </span>
                        <span class="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                          🧹 Cleanliness: <strong>{{ review.cleanlinessRating }}★</strong>
                        </span>
                        <span class="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                          🤝 Host: <strong>{{ review.hostResponsivenessRating }}★</strong>
                        </span>
                      </div>

                      <!-- Review Comment -->
                      <p class="text-xs text-gray-700 leading-relaxed italic bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                        "{{ review.comment }}"
                      </p>
                    </div>
                  }
                </div>
              } @else {
                <!-- Empty State -->
                <div class="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <div class="text-3xl mb-2">⭐</div>
                  <h4 class="text-sm font-bold text-gray-800">No verified reviews yet</h4>
                  <p class="text-xs text-gray-500 max-w-md mx-auto mt-1">
                    Bookings made at this facility will be able to leave operational ratings and dock feedback once confirmed.
                  </p>
                </div>
              }
            </div>
          </div>

          <!-- Availability & Booking Checkout Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm lg:sticky lg:top-24 space-y-5">
              <div class="flex justify-between items-baseline border-b border-gray-100 pb-4">
                <span class="text-2xl font-black text-gray-900">
                  {{ warehouse()!.currency === 'USD' ? '$' : '₹' }}{{ warehouse()!.pricePerUnitPerDay }}
                </span>
                <span class="text-xs text-gray-500">per {{ warehouse()!.capacityUnit }} / day</span>
              </div>

              <!-- Prominent Minimum Stay Policy Pill -->
              <div class="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center justify-between shadow-xs">
                <div class="flex items-center gap-2.5">
                  <span class="text-xl">⏱️</span>
                  <div>
                    <span class="font-bold block text-gray-900">Minimum Stay Policy</span>
                    <span class="text-[11px] text-amber-800">Requires at least {{ warehouse()!.minBookingDays }} consecutive days</span>
                  </div>
                </div>
                <span class="text-xs font-black px-2.5 py-1 bg-amber-200/90 text-amber-950 rounded-lg border border-amber-300 whitespace-nowrap">
                  {{ warehouse()!.minBookingDays }} Days
                </span>
              </div>

              <!-- Capacity Overview -->
              <app-capacity-gauge 
                [total]="warehouse()!.totalCapacity" 
                [available]="availabilityResult() ? availabilityResult()!.availableCapacity : warehouse()!.totalCapacity" 
                [unit]="warehouse()!.capacityUnit"
              />

              <!-- Availability Check Form -->
              <div class="space-y-3 pt-2">
                <div>
                  <div class="flex justify-between items-center">
                    <label class="block text-xs font-semibold text-gray-700">Start Date (Check-in)</label>
                    <span class="text-[10px] text-gray-400">Earliest: Today</span>
                  </div>
                  <input 
                    type="date" 
                    [(ngModel)]="startDate" 
                    [min]="todayDate"
                    (change)="onStartDateChange()"
                    class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <div class="flex justify-between items-center">
                    <label class="block text-xs font-semibold text-gray-700">End Date (Check-out)</label>
                    @if (minEndDate) {
                      <span class="text-[10px] text-amber-700 font-medium">Min end: {{ minEndDate }}</span>
                    }
                  </div>
                  <input 
                    type="date" 
                    [(ngModel)]="endDate" 
                    [min]="minEndDate || todayDate"
                    (change)="onEndDateChange()"
                    class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700">Required Space ({{ warehouse()!.capacityUnit }})</label>
                  <input 
                    type="number" 
                    [(ngModel)]="quantity" 
                    (input)="onCheckAvailability()"
                    class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
              </div>

              <!-- Real-time Duration Validation Indicator -->
              @if (startDate && endDate) {
                @if (selectedDurationDays < warehouse()!.minBookingDays) {
                  <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
                    <div class="flex items-center gap-1.5 font-bold text-amber-950">
                      <span>⚠️</span>
                      <span>Below Minimum Booking Duration</span>
                    </div>
                    <p class="text-[11px] text-amber-800 leading-relaxed">
                      This warehouse requires a minimum stay of <strong>{{ warehouse()!.minBookingDays }} days</strong>. Your current selection is <strong>{{ selectedDurationDays }} day{{ selectedDurationDays === 1 ? '' : 's' }}</strong>.
                    </p>
                    <button 
                      type="button"
                      (click)="applyMinDaysDuration()"
                      class="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>⚡</span>
                      <span>Auto-extend to {{ warehouse()!.minBookingDays }} days (until {{ suggestedEndDateStr }})</span>
                    </button>
                  </div>
                } @else {
                  <div class="text-[11px] bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-900 flex items-center justify-between">
                    <span class="flex items-center gap-1">
                      <span>✓</span>
                      <span>Selected Duration: <strong>{{ selectedDurationDays }} days</strong></span>
                    </span>
                    <span class="text-[10px] text-emerald-700 font-semibold">(Meets {{ warehouse()!.minBookingDays }}d min)</span>
                  </div>
                }
              }

              <!-- Backend Availability Error Banner if any -->
              @if (availabilityError() && (!startDate || !endDate || selectedDurationDays >= warehouse()!.minBookingDays)) {
                <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{{ availabilityError() }}</span>
                </div>
              }

              <!-- Real-time Availability Calculation Result -->
              @if (checking()) {
                <div class="p-3 bg-gray-50 rounded-lg text-center text-xs text-gray-500 animate-pulse">
                  Checking calendar overlap...
                </div>
              } @else if (availabilityResult()) {
                <div 
                  class="p-4 rounded-xl border text-xs space-y-2"
                  [ngClass]="availabilityResult()!.isAvailable ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'"
                >
                  <div class="font-bold flex items-center justify-between">
                    <span>{{ availabilityResult()!.isAvailable ? '✓ Space Available' : '✕ Insufficient Space' }}</span>
                    <span>{{ availabilityResult()!.durationDays }} days</span>
                  </div>
                  <div>
                    Available on selected dates: <strong>{{ availabilityResult()!.availableCapacity }} {{ availabilityResult()!.capacityUnit }}</strong>
                  </div>
                  @if (availabilityResult()!.isAvailable) {
                    <div class="pt-2 border-t border-emerald-200 flex justify-between font-bold text-sm text-emerald-950">
                      <span>Total Estimated:</span>
                      <span>{{ availabilityResult()!.currency === 'USD' ? '$' : '₹' }}{{ availabilityResult()!.estimatedTotal }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Escrow Trust Banner -->
              <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
                <span>🛡️</span>
                <span><strong>WareSpace Escrow Protection:</strong> Your payment is held securely in escrow. The host is only paid after confirming your reservation.</span>
              </div>

              <!-- Payment & Action Button -->
              @if (authService.isAuthenticated()) {
                <button 
                  [disabled]="!availabilityResult()?.isAvailable || processingPayment() || (selectedDurationDays < warehouse()!.minBookingDays)"
                  (click)="onPayAndBook()"
                  class="w-full py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center gap-2"
                >
                  <span>💳</span>
                  <span>
                    {{ processingPayment() ? 'Processing Payment...' : 
                       (selectedDurationDays < warehouse()!.minBookingDays) ? 'Min. ' + warehouse()!.minBookingDays + ' Days Required' :
                       'Pay & Reserve Space (' + (warehouse()!.currency === 'USD' ? '$' : '₹') + (availabilityResult() ? availabilityResult()!.estimatedTotal : 0) + ')' }}
                  </span>
                </button>
              } @else {
                <a 
                  routerLink="/auth/login" 
                  class="block w-full py-3.5 text-center bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition shadow"
                >
                  Sign in to Pay & Reserve Space
                </a>
              }

              <!-- Host Direct Inquiry Button in Sidebar -->
              <div class="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  (click)="isInquiryDrawerOpen.set(true)"
                  class="w-full py-2.5 px-4 bg-white hover:bg-indigo-50/50 text-indigo-700 hover:text-indigo-800 border border-indigo-200 font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                >
                  <span class="text-base">💬</span>
                  <span>Inquire with Host (Direct Chat)</span>
                </button>
                <p class="text-[10px] text-gray-400 text-center mt-1.5">
                  Ask about trailer access, night gates, or forklift operators
                </p>
              </div>

            </div>
          </div>
        </div>

        <!-- Slide-over Customer ↔ Host Chat Drawer -->
        <app-inquiry-drawer
          [isOpen]="isInquiryDrawerOpen()"
          [warehouseId]="warehouse()!._id"
          [warehouseTitle]="warehouse()!.title"
          [managerName]="managerDisplayName"
          [managerPhone]="managerPhone"
          (close)="isInquiryDrawerOpen.set(false)"
        />
      </div>
    }
  `,
})
export class WarehouseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private reviewService = inject(ReviewService);
  authService = inject(AuthService);

  warehouse = signal<Warehouse | null>(null);
  availabilityResult = signal<AvailabilityResult | null>(null);
  availabilityError = signal<string | null>(null);
  isInquiryDrawerOpen = signal<boolean>(false);
  loading = signal<boolean>(true);
  checking = signal<boolean>(false);
  processingPayment = signal<boolean>(false);

  reviewsData = signal<WarehouseReviewsResponse | null>(null);
  loadingReviews = signal<boolean>(false);

  startDate: string = '';
  endDate: string = '';
  todayDate: string = '';
  minEndDate: string = '';
  quantity: number = 5000;

  round(val: number): number {
    return Math.round(val || 0);
  }

  getCustomerName(customerId: any): string {
    if (customerId && typeof customerId === 'object' && customerId.name) {
      return customerId.name;
    }
    return 'Verified Shipper';
  }

  getCustomerInitials(customerId: any): string {
    const name = this.getCustomerName(customerId);
    return name ? name.substring(0, 2).toUpperCase() : 'VS';
  }

  get managerDisplayName(): string {
    const mgr = this.warehouse()?.managerId;
    if (mgr && typeof mgr === 'object' && 'name' in mgr) {
      return (mgr as any).name || 'Facility Host';
    }
    return 'Facility Host';
  }

  get managerInitials(): string {
    const name = this.managerDisplayName;
    return name ? name.substring(0, 2).toUpperCase() : 'WH';
  }

  get managerPhone(): string {
    const mgr = this.warehouse()?.managerId;
    if (mgr && typeof mgr === 'object' && 'phone' in mgr) {
      return (mgr as any).phone || '';
    }
    return '';
  }

  get selectedDurationDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }

  get suggestedEndDateStr(): string {
    if (!this.startDate || !this.warehouse()) return '';
    const start = new Date(this.startDate);
    const minDays = this.warehouse()!.minBookingDays || 1;
    const end = new Date(start);
    end.setDate(end.getDate() + minDays);
    return end.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.loadRazorpayScript();
    const now = new Date();
    this.todayDate = now.toISOString().split('T')[0];

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchWarehouse(id);
      this.fetchReviews(id);
    }
  }

  fetchReviews(warehouseId: string) {
    this.loadingReviews.set(true);
    this.reviewService.getWarehouseReviews(warehouseId).subscribe({
      next: (res) => {
        if (res.data) {
          this.reviewsData.set(res.data);
        }
        this.loadingReviews.set(false);
      },
      error: () => {
        this.loadingReviews.set(false);
      },
    });
  }

  loadRazorpayScript() {
    if (typeof window !== 'undefined' && !document.getElementById('razorpay-checkout-js')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  fetchWarehouse(id: string) {
    this.http.get<ApiResponse<Warehouse>>(`${environment.apiUrl}/warehouses/${id}`).subscribe({
      next: (res) => {
        this.warehouse.set(res.data);
        this.loading.set(false);

        // Pre-fill sensible default dates: start tomorrow, end tomorrow + minBookingDays
        if (!this.startDate) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          this.startDate = tomorrow.toISOString().split('T')[0];

          const minDays = res.data.minBookingDays || 1;
          const defaultEnd = new Date(tomorrow);
          defaultEnd.setDate(defaultEnd.getDate() + minDays);
          this.endDate = defaultEnd.toISOString().split('T')[0];
          this.minEndDate = this.endDate;

          this.onCheckAvailability();
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onStartDateChange() {
    if (!this.startDate) return;
    const start = new Date(this.startDate);
    const minDays = this.warehouse()?.minBookingDays || 1;
    const minEnd = new Date(start);
    minEnd.setDate(minEnd.getDate() + minDays);
    this.minEndDate = minEnd.toISOString().split('T')[0];

    // If endDate is not set or less than minEndDate, automatically set it to minEndDate
    if (!this.endDate || new Date(this.endDate) < minEnd) {
      this.endDate = this.minEndDate;
    }
    this.onCheckAvailability();
  }

  onEndDateChange() {
    this.onCheckAvailability();
  }

  applyMinDaysDuration() {
    if (!this.startDate || !this.warehouse()) return;
    this.endDate = this.suggestedEndDateStr;
    this.onCheckAvailability();
  }

  onCheckAvailability() {
    this.availabilityError.set(null);
    if (!this.startDate || !this.endDate || !this.quantity || !this.warehouse()) return;

    // Do not call backend if duration is strictly less than minBookingDays
    if (this.selectedDurationDays < this.warehouse()!.minBookingDays) {
      this.availabilityResult.set(null);
      return;
    }

    this.checking.set(true);
    const id = this.warehouse()!._id;

    this.http
      .get<ApiResponse<AvailabilityResult>>(`${environment.apiUrl}/bookings/warehouses/${id}/availability`, {
        params: {
          startDate: this.startDate,
          endDate: this.endDate,
          quantity: this.quantity,
        },
      })
      .subscribe({
        next: (res) => {
          this.availabilityResult.set(res.data);
          this.checking.set(false);
          this.availabilityError.set(null);
        },
        error: (err) => {
          this.availabilityResult.set(null);
          this.checking.set(false);
          this.availabilityError.set(err.error?.message || 'Could not verify availability.');
        },
      });
  }

  onPayAndBook() {
    if (!this.availabilityResult()?.isAvailable) return;

    this.processingPayment.set(true);

    const payload = {
      warehouseId: this.warehouse()!._id,
      startDate: this.startDate,
      endDate: this.endDate,
      quantityBooked: this.quantity,
    };

    // Step 1: Create Razorpay order and reserve space
    this.http
      .post<ApiResponse<any>>(`${environment.apiUrl}/payments/create-order`, payload)
      .subscribe({
        next: (res) => {
          const orderData = res.data;
          this.launchRazorpayCheckout(orderData);
        },
        error: (err) => {
          this.processingPayment.set(false);
          alert(err.error?.message || 'Could not initiate payment order.');
        },
      });
  }

  launchRazorpayCheckout(orderData: any) {
    const symbol = orderData.currency === 'USD' ? '$' : '₹';

    // If Razorpay SDK loaded and valid key available
    if (typeof window.Razorpay !== 'undefined' && orderData.keyId && !orderData.keyId.includes('warehousespace')) {
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'WareSpace Marketplace',
        description: `Storage Reservation for ${orderData.warehouseTitle}`,
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100',
        order_id: orderData.orderId,
        handler: (response: any) => {
          this.verifyPayment({
            bookingId: orderData.bookingId,
            orderId: response.razorpay_order_id || orderData.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: this.authService.currentUser()?.name || 'Customer',
          email: this.authService.currentUser()?.email || 'customer@example.com',
          contact: this.authService.currentUser()?.phone || '9999999999',
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      this.processingPayment.set(false);
    } else {
      // Developer Sandbox Checkout Simulator
      const simulatedPayment = confirm(
        `💳 [Razorpay Checkout Simulator]\n\n` +
        `Facility: ${orderData.warehouseTitle}\n` +
        `Amount: ${symbol}${orderData.estimatedTotal} ${orderData.currency}\n` +
        `Payment Method: UPI / Net Banking / Card\n\n` +
        `Click "OK" to simulate SUCCESSFUL payment, or "Cancel" to abort.`
      );

      if (simulatedPayment) {
        this.verifyPayment({
          bookingId: orderData.bookingId,
          orderId: orderData.orderId,
          paymentId: `pay_sim_${Date.now()}`,
          signature: 'simulated_signature_valid',
        });
      } else {
        this.processingPayment.set(false);
      }
    }
  }

  verifyPayment(verificationPayload: any) {
    this.http
      .post<ApiResponse<any>>(`${environment.apiUrl}/payments/verify`, verificationPayload)
      .subscribe({
        next: () => {
          this.processingPayment.set(false);
          alert('🎉 Payment secured in escrow! Your reservation request has been submitted to the warehouse host.');
          this.router.navigate(['/my-bookings']);
        },
        error: (err) => {
          this.processingPayment.set(false);
          alert(err.error?.message || 'Payment verification failed.');
        },
      });
  }
}
