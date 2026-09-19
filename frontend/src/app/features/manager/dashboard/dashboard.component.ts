import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { Warehouse } from '../../../core/models/warehouse.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CapacityGaugeComponent } from '../../../shared/components/capacity-gauge/capacity-gauge.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CapacityGaugeComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Host Management Dashboard</h1>
          <p class="text-sm text-gray-500 mt-1">Manage physical facilities, inventory occupancy, and revenue.</p>
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
            <span class="text-xs text-indigo-600 font-semibold">Total</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved & Live</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-emerald-600">{{ approvedCount }}</span>
            <span class="text-xs text-gray-400">On Marketplace</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Review</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-amber-600">{{ pendingCount }}</span>
            <span class="text-xs text-amber-700">Awaiting Admin</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Host Status</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              ✓ Active Operator
            </span>
          </div>
        </div>
      </div>

      <!-- My Warehouse Listings Section -->
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

        @if (loading()) {
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
  loading = signal<boolean>(true);

  ngOnInit() {
    this.fetchManagerWarehouses();
  }

  get approvedCount(): number {
    return this.warehouses().filter((w) => w.verificationStatus === 'APPROVED').length;
  }

  get pendingCount(): number {
    return this.warehouses().filter((w) => w.verificationStatus === 'PENDING').length;
  }

  fetchManagerWarehouses() {
    this.loading.set(true);
    this.http
      .get<ApiResponse<Warehouse[]>>(`${environment.apiUrl}/warehouses/manager/my-warehouses`)
      .subscribe({
        next: (res) => {
          this.warehouses.set(res.data || []);
          this.loading.set(false);
        },
        error: () => {
          this.warehouses.set([]);
          this.loading.set(false);
        },
      });
  }
}
