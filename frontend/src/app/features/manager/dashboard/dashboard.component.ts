import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { Warehouse } from '../../../core/models/warehouse.model';
import { Booking, BookingStatus } from '../../../core/models/booking.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Inquiry, InquiryMessage } from '../../../core/models/inquiry.model';
import { InquiryService } from '../../../core/services/inquiry.service';
import { CapacityGaugeComponent } from '../../../shared/components/capacity-gauge/capacity-gauge.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CapacityGaugeComponent, StatusBadgeComponent],
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Facilities</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-gray-900">{{ warehouses().length }}</span>
            <span class="text-xs text-indigo-600 font-semibold">{{ approvedCount }} Live</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Requests</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-amber-600">{{ pendingBookingsCount }}</span>
            <span class="text-xs text-amber-700 font-semibold">Needs Approval</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmed Bookings</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-emerald-600">{{ confirmedBookingsCount }}</span>
            <span class="text-xs text-emerald-700 font-semibold">Active</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Inquiries</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-indigo-600">{{ inquiries().length }}</span>
            @if (unreadInquiriesCount > 0) {
              <span class="text-xs text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded-full animate-pulse">
                {{ unreadInquiriesCount }} New
              </span>
            } @else {
              <span class="text-xs text-gray-400 font-semibold">Threads</span>
            }
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Value</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-extrabold text-gray-900">₹{{ totalRevenue.toLocaleString() }}</span>
            <span class="text-xs text-emerald-600 font-semibold">₹{{ hostEarnings.toLocaleString() }}</span>
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
                  </div>
                  
                  <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span>👤 Customer: <strong>{{ getCustomerName(booking) }}</strong> ({{ getCustomerEmail(booking) }})</span>
                    <span>📞 {{ getCustomerPhone(booking) }}</span>
                  </div>

                  <div class="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                    <span>📅 Dates: <strong>{{ booking.startDate | date:'mediumDate' }}</strong> to <strong>{{ booking.endDate | date:'mediumDate' }}</strong></span>
                    <span>📦 Space: <strong>{{ booking.quantityBooked }} {{ getCapacityUnit(booking) }}</strong></span>
                    <span class="font-bold text-gray-900">Total Value: ₹{{ booking.totalAmount }}</span>
                  </div>
                </div>

                <!-- Host Approval Actions -->
                <div class="flex items-center gap-3 w-full lg:w-auto justify-end">
                  @if (booking.status === 'PENDING') {
                    <button 
                      type="button" 
                      (click)="onUpdateBookingStatus(booking._id, 'CANCELLED')"
                      [disabled]="updatingBookingId() === booking._id"
                      class="px-4 py-2 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                    >
                      ✕ Decline
                    </button>
                    <button 
                      type="button" 
                      (click)="onUpdateBookingStatus(booking._id, 'CONFIRMED')"
                      [disabled]="updatingBookingId() === booking._id"
                      class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <span>✓</span> Confirm Reservation
                    </button>
                  } @else if (booking.status === 'CONFIRMED' || booking.status === 'ACTIVE') {
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

      <!-- Section 2: Customer Pre-Booking Operational Inquiries -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
        <div class="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/70">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-bold text-base text-gray-900">Customer Pre-Booking Inquiries</h2>
              @if (unreadInquiriesCount > 0) {
                <span class="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-full animate-pulse">
                  {{ unreadInquiriesCount }} New
                </span>
              }
            </div>
            <p class="text-xs text-gray-500">Direct operational questions from potential customers regarding trailer clearance, forklift operators, and security</p>
          </div>

          <button 
            type="button" 
            (click)="fetchInquiries()" 
            class="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition shadow-xs flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh Inquiries
          </button>
        </div>

        @if (loadingInquiries()) {
          <div class="py-16 text-center text-xs text-gray-500">Loading customer inquiries...</div>
        } @else if (inquiries().length === 0) {
          <div class="py-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl flex items-center justify-center mx-auto mb-3">
              💬
            </div>
            <p class="text-sm font-semibold text-gray-700">No customer inquiries yet.</p>
            <p class="text-xs text-gray-400 mt-1">When customers inquire about your facilities, their questions will appear here for direct chat.</p>
          </div>
        } @else {
          <div class="divide-y divide-gray-100">
            @for (inq of inquiries(); track inq._id) {
              <div 
                class="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-gray-50/60 transition"
                [ngClass]="{'bg-indigo-50/30': inq.unreadManagerCount > 0}"
              >
                <!-- Customer info & last message -->
                <div class="flex items-start gap-4 flex-1">
                  <div class="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                    {{ inq.customerId.name ? inq.customerId.name.substring(0, 2).toUpperCase() : 'CU' }}
                  </div>

                  <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="font-bold text-sm text-gray-900">{{ inq.customerId.name || 'Customer' }}</span>
                      <span class="text-xs text-gray-400">({{ inq.customerId.email || 'N/A' }} • {{ inq.customerId.phone || 'No phone' }})</span>
                      @if (inq.unreadManagerCount > 0) {
                        <span class="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full border border-amber-200">
                          {{ inq.unreadManagerCount }} New Message{{ inq.unreadManagerCount > 1 ? 's' : '' }}
                        </span>
                      }
                    </div>

                    <div class="flex items-center gap-1.5 text-xs text-indigo-700 font-medium">
                      <span>🏢</span>
                      <span>{{ inq.warehouseId.title || 'Warehouse Facility' }}</span>
                      @if (inq.warehouseId.address && inq.warehouseId.address.city) {
                        <span class="text-gray-400 font-normal">({{ inq.warehouseId.address.city }})</span>
                      }
                    </div>

                    <p class="text-xs text-gray-600 line-clamp-1 italic bg-white p-2 rounded-lg border border-gray-100 max-w-2xl">
                      "{{ inq.lastMessage || 'Customer started an inquiry.' }}"
                    </p>

                    <span class="text-[10px] text-gray-400 block">
                      Last activity: {{ inq.lastMessageAt | date:'medium' }}
                    </span>
                  </div>
                </div>

                <!-- Action button -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button 
                    type="button" 
                    (click)="openInquiryChat(inq)"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5"
                  >
                    <span>💬</span>
                    <span>Reply to Customer</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Section 3: My Warehouse Listings -->
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
                    <p class="text-xs text-gray-500 mt-1">
                      📍 {{ item.address.city }}, {{ item.address.state }} • {{ item.totalCapacity.toLocaleString() }} {{ item.capacityUnit }} • {{ item.currency === 'USD' ? '$' : '₹' }}{{ item.pricePerUnitPerDay }}/day
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <a 
                    [routerLink]="['/manager/warehouses', item._id, 'edit']" 
                    class="px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm"
                  >
                    Edit
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

      <!-- Manager Reply Chat Modal -->
      @if (activeInquiry()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs z-[2000] flex items-center justify-center p-4" (click)="closeInquiryChat()">
          <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] border border-gray-200" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-sm text-gray-900">Chat with {{ activeInquiry()!.customerId.name || 'Customer' }}</h3>
                  <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full border border-indigo-100">Customer</span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  🏢 {{ activeInquiry()!.warehouseId.title }}
                </p>
              </div>
              <button 
                type="button" 
                (click)="closeInquiryChat()"
                class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200/60 transition text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <!-- Messages Stream -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 min-h-[300px] max-h-[420px]">
              @for (msg of activeInquiry()!.messages; track msg._id || msg.createdAt) {
                <div 
                  class="flex flex-col"
                  [ngClass]="msg.senderRole === 'MANAGER' ? 'items-end' : 'items-start'"
                >
                  <div class="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5 px-1">
                    <span class="font-bold text-gray-600">{{ msg.senderRole === 'MANAGER' ? 'You (Host)' : msg.senderName }}</span>
                    <span>•</span>
                    <span>{{ msg.createdAt | date:'shortTime' }}</span>
                  </div>
                  <div 
                    class="max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs text-xs"
                    [ngClass]="msg.senderRole === 'MANAGER' 
                      ? 'bg-indigo-600 text-white rounded-tr-xs' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-xs'"
                  >
                    <p class="whitespace-pre-line">{{ msg.text }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Reply Input Box -->
            <div class="p-3 bg-white border-t border-gray-200 space-y-2">
              <div class="flex items-end gap-2">
                <textarea 
                  [(ngModel)]="replyText" 
                  (keydown.enter)="onReplyKeyDown($event)"
                  rows="2"
                  placeholder="Type your operational response (e.g. 'Yes, our 40-ft bays are accessible 24/7')..."
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
                <button 
                  type="button" 
                  (click)="sendInquiryReply()" 
                  [disabled]="!replyText.trim() || sendingReply()"
                  class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1"
                >
                  @if (sendingReply()) {
                    <span>⏳</span>
                  } @else {
                    <span>Reply</span>
                    <span>➔</span>
                  }
                </button>
              </div>
              <div class="flex justify-between items-center text-[10px] text-gray-400 px-1">
                <span>Press Enter to send reply</span>
                <span>Contact: {{ activeInquiry()!.customerId.phone || activeInquiry()!.customerId.email }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManagerDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  authService = inject(AuthService);
  inquiryService = inject(InquiryService);

  warehouses = signal<Warehouse[]>([]);
  bookings = signal<any[]>([]);
  inquiries = signal<Inquiry[]>([]);
  activeInquiry = signal<Inquiry | null>(null);
  loadingWarehouses = signal<boolean>(true);
  loadingBookings = signal<boolean>(true);
  loadingInquiries = signal<boolean>(false);
  updatingBookingId = signal<string | null>(null);
  sendingReply = signal<boolean>(false);

  bookingFilter: string = 'PENDING';
  replyText: string = '';

  ngOnInit() {
    this.fetchManagerWarehouses();
    this.fetchIncomingBookings();
    this.fetchInquiries();
  }

  get unreadInquiriesCount(): number {
    return this.inquiries().reduce((sum, i) => sum + (i.unreadManagerCount || 0), 0);
  }

  fetchInquiries() {
    this.loadingInquiries.set(true);
    this.inquiryService.getManagerInbox().subscribe({
      next: (res) => {
        this.inquiries.set(res.data || []);
        this.loadingInquiries.set(false);
      },
      error: () => {
        this.inquiries.set([]);
        this.loadingInquiries.set(false);
      },
    });
  }

  openInquiryChat(inquiry: Inquiry) {
    this.activeInquiry.set(inquiry);
    this.replyText = '';
    if (inquiry.unreadManagerCount > 0) {
      this.inquiryService.markAsRead(inquiry._id).subscribe({
        next: () => {
          inquiry.unreadManagerCount = 0;
        },
      });
    }
  }

  closeInquiryChat() {
    this.activeInquiry.set(null);
    this.replyText = '';
    this.fetchInquiries();
  }

  onReplyKeyDown(e: any) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendInquiryReply();
    }
  }

  sendInquiryReply() {
    const text = this.replyText.trim();
    if (!text || !this.activeInquiry() || this.sendingReply()) return;

    this.sendingReply.set(true);
    this.inquiryService.sendMessage(this.activeInquiry()!._id, text).subscribe({
      next: (res) => {
        this.activeInquiry.set(res.data);
        this.replyText = '';
        this.sendingReply.set(false);
        this.fetchInquiries();
      },
      error: (err) => {
        this.sendingReply.set(false);
        alert(err.error?.message || 'Could not send reply.');
      },
    });
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
