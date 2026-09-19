import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Warehouse, AvailabilityResult } from '../../../core/models/warehouse.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CapacityGaugeComponent } from '../../../shared/components/capacity-gauge/capacity-gauge.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CapacityGaugeComponent],
  template: `
    @if (loading()) {
      <div class="py-20 text-center text-gray-500">Loading facility details...</div>
    } @else if (warehouse()) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <div>
              <span class="text-xs font-semibold uppercase text-indigo-600 tracking-wider">
                {{ warehouse()!.capacityUnit }} Storage
              </span>
              <h1 class="text-3xl font-extrabold text-gray-900 mt-1">{{ warehouse()!.title }}</h1>
              <p class="text-sm text-gray-500 mt-2">
                📍 {{ warehouse()!.address.street }}, {{ warehouse()!.address.city }}, {{ warehouse()!.address.state }} {{ warehouse()!.address.postalCode }}
              </p>
            </div>

            <!-- Image placeholder / gallery -->
            <div class="h-80 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
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
          </div>

          <!-- Availability & Booking Widget Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24 space-y-5">
              <div class="flex justify-between items-baseline border-b border-gray-100 pb-4">
                <span class="text-2xl font-black text-gray-900">\${{ warehouse()!.pricePerUnitPerDay }}</span>
                <span class="text-xs text-gray-500">per {{ warehouse()!.capacityUnit }} / day</span>
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
                  <label class="block text-xs font-semibold text-gray-700">Start Date</label>
                  <input 
                    type="date" 
                    [(ngModel)]="startDate" 
                    (change)="onCheckAvailability()"
                    class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700">End Date</label>
                  <input 
                    type="date" 
                    [(ngModel)]="endDate" 
                    (change)="onCheckAvailability()"
                    class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700">Required Space ({{ warehouse()!.capacityUnit }})</label>
                  <input 
                    type="number" 
                    [(ngModel)]="quantity" 
                    (input)="onCheckAvailability()"
                    class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                  />
                </div>
              </div>

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
                      <span>\${{ availabilityResult()!.estimatedTotal }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Action Button -->
              @if (authService.isAuthenticated()) {
                <button 
                  [disabled]="!availabilityResult()?.isAvailable"
                  (click)="onBookNow()"
                  class="w-full py-3 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Confirm Reservation
                </button>
              } @else {
                <a 
                  routerLink="/auth/login" 
                  class="block w-full py-3 text-center bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition"
                >
                  Sign in to Reserve Space
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class WarehouseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  authService = inject(AuthService);

  warehouse = signal<Warehouse | null>(null);
  availabilityResult = signal<AvailabilityResult | null>(null);
  loading = signal<boolean>(true);
  checking = signal<boolean>(false);

  startDate: string = '';
  endDate: string = '';
  quantity: number = 100;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchWarehouse(id);
    }
  }

  fetchWarehouse(id: string) {
    this.http.get<ApiResponse<Warehouse>>(`${environment.apiUrl}/warehouses/${id}`).subscribe({
      next: (res) => {
        this.warehouse.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onCheckAvailability() {
    if (!this.startDate || !this.endDate || !this.quantity || !this.warehouse()) return;

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
        },
        error: () => {
          this.availabilityResult.set(null);
          this.checking.set(false);
        },
      });
  }

  onBookNow() {
    if (!this.availabilityResult()?.isAvailable) return;

    this.http
      .post<ApiResponse<any>>(`${environment.apiUrl}/bookings`, {
        warehouseId: this.warehouse()!._id,
        startDate: this.startDate,
        endDate: this.endDate,
        quantityBooked: this.quantity,
      })
      .subscribe({
        next: () => {
          alert('Booking placed successfully!');
          this.router.navigate(['/my-bookings']);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to complete booking');
        },
      });
  }
}
