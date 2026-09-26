import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Warehouse } from '../../../core/models/warehouse.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-verifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Listing & Host Verifications</h1>
          <p class="text-sm text-gray-500 mt-1">Review newly submitted physical warehouses, verify specs, and publish to the marketplace.</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/admin/users" class="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 shadow-sm transition">
            View All Users →
          </a>
        </div>
      </div>

      <!-- Tab Filter Selector -->
      <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        <button 
          type="button" 
          (click)="setFilter('PENDING')"
          class="px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2"
          [ngClass]="currentStatus === 'PENDING' ? 'bg-amber-100 text-amber-900 border border-amber-200 shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
        >
          <span>⏳ Pending Review</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-200/70 text-amber-950 font-extrabold">
            {{ countPending }}
          </span>
        </button>

        <button 
          type="button" 
          (click)="setFilter('APPROVED')"
          class="px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2"
          [ngClass]="currentStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
        >
          <span>✓ Approved & Live</span>
        </button>

        <button 
          type="button" 
          (click)="setFilter('ALL')"
          class="px-4 py-2 text-xs font-bold rounded-lg transition"
          [ngClass]="currentStatus === 'ALL' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
        >
          All Facilities
        </button>
      </div>

      <!-- Listings Review Cards -->
      @if (loading()) {
        <div class="py-20 text-center text-xs text-gray-500">Loading facilities for review...</div>
      } @else if (warehouses().length === 0) {
        <div class="py-20 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div class="text-3xl mb-3">🎉</div>
          <h3 class="font-bold text-gray-900 text-base">All Caught Up!</h3>
          <p class="text-xs text-gray-500 mt-1">No warehouses currently found with status '{{ currentStatus }}'.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (item of warehouses(); track item._id) {
            <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-gray-300 transition">
              <!-- Facility Details -->
              <div class="flex flex-col sm:flex-row items-start gap-4 flex-1">
                <div class="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                  @if (item.images && item.images.length > 0) {
                    <img [src]="item.images[0]" [alt]="item.title" class="w-full h-full object-cover" />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo</div>
                  }
                </div>

                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-base text-gray-900">{{ item.title }}</h3>
                    <span 
                      class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase"
                      [ngClass]="{
                        'bg-amber-100 text-amber-800 border border-amber-200': item.verificationStatus === 'PENDING',
                        'bg-emerald-100 text-emerald-800 border border-emerald-200': item.verificationStatus === 'APPROVED',
                        'bg-rose-100 text-rose-800 border border-rose-200': item.verificationStatus === 'REJECTED'
                      }"
                    >
                      {{ item.verificationStatus }}
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 font-medium">
                    Host: <strong class="text-gray-800">{{ getHostName(item) }}</strong> 
                    (<span class="text-indigo-600">{{ getHostEmail(item) }}</span>)
                  </p>

                  <p class="text-xs text-gray-600">
                    📍 {{ item.address.street }}, {{ item.address.city }}, {{ item.address.state }} {{ item.address.postalCode }}, {{ item.address.country }}
                  </p>

                  <div class="pt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-700">
                    <span>Capacity: <strong>{{ item.totalCapacity.toLocaleString() }}</strong> {{ item.capacityUnit }}</span>
                    <span>•</span>
                    <span>Rate: <strong>{{ item.currency === 'USD' ? '$' : '₹' }}{{ item.pricePerUnitPerDay }}</strong>/day</span>
                    <span>•</span>
                    <span>Min. Days: <strong>{{ item.minBookingDays }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                <a 
                  [routerLink]="['/warehouses', item._id]" 
                  target="_blank"
                  class="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition border border-gray-200"
                >
                  Preview Page ↗
                </a>

                @if (item.verificationStatus !== 'APPROVED') {
                  <button 
                    type="button" 
                    (click)="onApprove(item)"
                    [disabled]="processingId() === item._id"
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>✓</span> Approve & Publish
                  </button>
                }

                @if (item.verificationStatus !== 'REJECTED') {
                  <button 
                    type="button" 
                    (click)="onReject(item)"
                    [disabled]="processingId() === item._id"
                    class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition border border-rose-200 disabled:opacity-50"
                  >
                    ✕ Reject
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class VerificationsComponent implements OnInit {
  private http = inject(HttpClient);

  warehouses = signal<Warehouse[]>([]);
  loading = signal<boolean>(true);
  processingId = signal<string | null>(null);

  currentStatus = 'PENDING';
  countPending = 0;

  ngOnInit() {
    this.fetchPendingWarehouses();
  }

  setFilter(status: string) {
    this.currentStatus = status;
    this.fetchPendingWarehouses();
  }

  fetchPendingWarehouses() {
    this.loading.set(true);
    this.http
      .get<ApiResponse<Warehouse[]>>(`${environment.apiUrl}/admin/warehouses/pending`, {
        params: { status: this.currentStatus },
      })
      .subscribe({
        next: (res) => {
          this.warehouses.set(res.data || []);
          if (this.currentStatus === 'PENDING') {
            this.countPending = res.data?.length || 0;
          }
          this.loading.set(false);
        },
        error: () => {
          this.warehouses.set([]);
          this.loading.set(false);
        },
      });
  }

  getHostName(item: Warehouse): string {
    if (typeof item.managerId === 'object' && item.managerId?.name) {
      return item.managerId.name;
    }
    return 'Host';
  }

  getHostEmail(item: Warehouse): string {
    if (typeof item.managerId === 'object' && item.managerId?.email) {
      return item.managerId.email;
    }
    return 'No email';
  }

  onApprove(warehouse: Warehouse) {
    if (!confirm(`Are you sure you want to APPROVE "${warehouse.title}" and make it publicly available for bookings?`)) {
      return;
    }

    this.processingId.set(warehouse._id);

    this.http
      .patch<ApiResponse<Warehouse>>(
        `${environment.apiUrl}/admin/warehouses/${warehouse._id}/verification`,
        { status: 'APPROVED' }
      )
      .subscribe({
        next: () => {
          this.processingId.set(null);
          alert(`"${warehouse.title}" has been approved! It is now live on the marketplace.`);
          this.fetchPendingWarehouses();
        },
        error: (err) => {
          this.processingId.set(null);
          alert(err.error?.message || 'Failed to approve warehouse.');
        },
      });
  }

  onReject(warehouse: Warehouse) {
    const reason = prompt(`Enter rejection reason for "${warehouse.title}" (optional):`);
    if (reason === null) return; // cancelled

    this.processingId.set(warehouse._id);

    this.http
      .patch<ApiResponse<Warehouse>>(
        `${environment.apiUrl}/admin/warehouses/${warehouse._id}/verification`,
        { status: 'REJECTED', rejectionReason: reason }
      )
      .subscribe({
        next: () => {
          this.processingId.set(null);
          alert(`"${warehouse.title}" has been rejected.`);
          this.fetchPendingWarehouses();
        },
        error: (err) => {
          this.processingId.set(null);
          alert(err.error?.message || 'Failed to reject warehouse.');
        },
      });
  }
}
