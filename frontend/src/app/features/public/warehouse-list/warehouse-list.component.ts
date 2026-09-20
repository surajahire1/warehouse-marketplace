import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Warehouse } from '../../../core/models/warehouse.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CapacityGaugeComponent } from '../../../shared/components/capacity-gauge/capacity-gauge.component';
import { WarehouseMapComponent } from '../../../shared/components/warehouse-map/warehouse-map.component';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CapacityGaugeComponent, WarehouseMapComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Title & Controls Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Available Warehouses</h1>
          <p class="text-sm text-gray-500 mt-1">Browse verified commercial facilities with live capacity and proximity search.</p>
        </div>

        <!-- View Mode & GPS Controls -->
        <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <!-- View Switcher (Grid vs Split Map) -->
          <div class="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              type="button"
              (click)="viewMode = 'grid'"
              class="px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5"
              [ngClass]="viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            >
              <span>▦</span>
              <span>Grid</span>
            </button>
            <button
              type="button"
              (click)="viewMode = 'split'"
              class="px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5"
              [ngClass]="viewMode === 'split' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            >
              <span>🗺️</span>
              <span>Split Map</span>
            </button>
          </div>

          <!-- Near Me & GPS Controls -->
          <button 
            type="button"
            (click)="onFindNearest()"
            [disabled]="locating()"
            class="px-4 py-2 text-xs font-bold rounded-lg transition shadow-sm inline-flex items-center gap-1.5"
            [ngClass]="hasLocationCoords() ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
          >
            @if (locating()) {
              <span class="animate-spin">⏳</span> Locating...
            } @else if (hasLocationCoords()) {
              <span>✓ 📍 Near Me Active</span>
            } @else {
              <span>📍 Find Nearest (GPS)</span>
            }
          </button>

          @if (hasLocationCoords()) {
            <!-- Radius Selector -->
            <select 
              [(ngModel)]="radiusKm" 
              (change)="applyFilters()"
              class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option [value]="25">Within 25 km</option>
              <option [value]="50">Within 50 km</option>
              <option [value]="100">Within 100 km</option>
              <option [value]="250">Within 250 km</option>
              <option [value]="500">Within 500 km</option>
            </select>

            <button 
              type="button" 
              (click)="clearLocationFilter()"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
            >
              ✕ Clear Location
            </button>
          }
        </div>
      </div>

      <!-- Quick Filter Bar -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <!-- Hub Filter Chips -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="text-gray-400 font-semibold uppercase text-[10px]">Popular Hub:</span>
          <button 
            type="button"
            (click)="selectCityFilter('')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="!selectedCity ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            All Locations
          </button>
          <button 
            type="button"
            (click)="selectCityFilter('Navsari')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="selectedCity === 'Navsari' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            📍 Surat / Navsari
          </button>
          <button 
            type="button"
            (click)="selectCityFilter('Bhiwandi')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="selectedCity === 'Bhiwandi' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            📍 Bhiwandi (Mumbai)
          </button>
          <button 
            type="button"
            (click)="selectCityFilter('Gurugram')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="selectedCity === 'Gurugram' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            📍 Gurugram (NCR)
          </button>
          <button 
            type="button"
            (click)="selectCityFilter('Hoskote')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="selectedCity === 'Hoskote' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            📍 Hoskote (Bengaluru)
          </button>
        </div>

        <!-- City Search Input -->
        <div class="flex items-center gap-2">
          <input 
            type="text" 
            [(ngModel)]="selectedCity" 
            (keyup.enter)="applyFilters()"
            placeholder="Search by city..." 
            class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            type="button"
            (click)="applyFilters()" 
            class="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition"
          >
            Filter
          </button>
        </div>
      </div>

      <!-- Active GPS Indicator Banner -->
      @if (hasLocationCoords()) {
        <div class="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm">📍</span>
            <span>Showing facilities sorted by <strong>closest proximity</strong> to your current location (within {{ radiusKm }} km).</span>
          </div>
          <span class="font-bold text-emerald-700">{{ warehouses().length }} found</span>
        </div>
      }

      <!-- Loading State -->
      @if (loading()) {
        <div class="py-20 text-center text-gray-500">Loading warehouses...</div>
      } @else if (warehouses().length === 0) {
        <div class="py-20 text-center bg-white rounded-xl border border-gray-200">
          <p class="text-gray-500 font-medium">No warehouses match your current search filters.</p>
          <button (click)="resetAllFilters()" class="mt-4 inline-block text-sm text-indigo-600 font-semibold hover:underline">
            Reset Filters & View All
          </button>
        </div>
      } @else {

        <!-- VIEW MODE 1: SPLIT SCREEN (CARDS + INTERACTIVE MAP) -->
        @if (viewMode === 'split') {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- Left Side: Scrollable Warehouse List (6 cols) -->
            <div class="lg:col-span-6 space-y-4 max-h-[820px] overflow-y-auto pr-2">
              @for (warehouse of warehouses(); track warehouse._id) {
                <div 
                  (mouseenter)="hoveredWarehouseId = warehouse._id"
                  (mouseleave)="hoveredWarehouseId = null"
                  class="bg-white p-4 rounded-xl border transition shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-4"
                  [ngClass]="hoveredWarehouseId === warehouse._id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200'"
                >
                  <!-- Thumbnail -->
                  <div class="w-full sm:w-44 h-36 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0">
                    @if (warehouse.images && warehouse.images.length > 0) {
                      <img [src]="warehouse.images[0]" [alt]="warehouse.title" class="w-full h-full object-cover" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo</div>
                    }
                    <span class="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-gray-900 shadow">
                      {{ warehouse.currency === 'USD' ? '$' : '₹' }}{{ warehouse.pricePerUnitPerDay }}/day
                    </span>
                  </div>

                  <!-- Details -->
                  <div class="flex-1 flex flex-col justify-between">
                    <div>
                      <div class="flex items-start justify-between gap-2">
                        <h3 class="font-bold text-gray-900 text-sm leading-snug">{{ warehouse.title }}</h3>
                        @if (warehouse.distanceKm !== undefined) {
                          <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                            📍 {{ warehouse.distanceKm }} km
                          </span>
                        }
                      </div>

                      <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span>📍</span> {{ warehouse.address.city }}, {{ warehouse.address.state }}
                      </p>

                      <p class="text-xs text-gray-600 mt-2 line-clamp-2">{{ warehouse.description }}</p>
                    </div>

                    <div class="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                      <span class="text-xs font-semibold text-gray-700">
                        {{ warehouse.totalCapacity.toLocaleString() }} {{ warehouse.capacityUnit }}
                      </span>
                      <a 
                        [routerLink]="['/warehouses', warehouse._id]"
                        class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs"
                      >
                        Reserve Space ➔
                      </a>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Right Side: Sticky Interactive Map (6 cols) -->
            <div class="lg:col-span-6 sticky top-20 h-[550px] lg:h-[820px]">
              <app-warehouse-map 
                [warehouses]="warehouses()"
                [userLat]="userLat"
                [userLng]="userLng"
                [radiusKm]="radiusKm"
                [selectedWarehouseId]="hoveredWarehouseId"
                (warehouseSelected)="onWarehouseSelected($event)"
              />
            </div>
          </div>
        }

        <!-- VIEW MODE 2: FULL GRID VIEW -->
        @if (viewMode === 'grid') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (warehouse of warehouses(); track warehouse._id) {
              <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                <div class="h-44 bg-gray-100 relative">
                  @if (warehouse.images && warehouse.images.length > 0) {
                    <img [src]="warehouse.images[0]" [alt]="warehouse.title" class="w-full h-full object-cover" />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo Provided</div>
                  }

                  <!-- Price Tag -->
                  <span class="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-xs font-bold text-gray-900 shadow">
                    {{ warehouse.currency === 'USD' ? '$' : '₹' }}{{ warehouse.pricePerUnitPerDay }}/{{ warehouse.capacityUnit }}/day
                  </span>

                  <!-- Distance Pill Badge -->
                  @if (warehouse.distanceKm !== undefined) {
                    <span class="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur text-white px-2.5 py-1 rounded-md text-xs font-bold shadow flex items-center gap-1">
                      <span>📍</span>
                      <span>{{ warehouse.distanceKm }} km away</span>
                    </span>
                  }
                </div>

                <div class="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 class="font-bold text-gray-900 text-base leading-tight">{{ warehouse.title }}</h3>
                    
                    <div class="flex items-center gap-2 mt-1">
                      <p class="text-xs text-gray-500 flex items-center gap-1">
                        <span>📍</span> {{ warehouse.address.city }}, {{ warehouse.address.state }}
                      </p>
                      @if (warehouse.distanceKm !== undefined) {
                        <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {{ warehouse.distanceKm }} km
                        </span>
                      }
                    </div>

                    <p class="text-xs text-gray-600 mt-3 line-clamp-2">{{ warehouse.description }}</p>
                  </div>

                  <div class="mt-6 pt-4 border-t border-gray-100">
                    <app-capacity-gauge 
                      [total]="warehouse.totalCapacity" 
                      [available]="warehouse.totalCapacity" 
                      [unit]="warehouse.capacityUnit"
                    />
                    <div class="mt-4">
                      <a 
                        [routerLink]="['/warehouses', warehouse._id]" 
                        class="block w-full text-center py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition"
                      >
                        View Space & Reserve
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

      }
    </div>
  `,
})
export class WarehouseListComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  warehouses = signal<Warehouse[]>([]);
  loading = signal<boolean>(true);
  locating = signal<boolean>(false);

  viewMode: 'grid' | 'split' = 'split'; // Default to modern Split Map view!
  hoveredWarehouseId: string | null = null;

  selectedCity: string = '';
  radiusKm: number = 500;
  userLat: number | null = null;
  userLng: number | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedCity = params['city'] || '';
      this.userLat = params['latitude'] ? parseFloat(params['latitude']) : null;
      this.userLng = params['longitude'] ? parseFloat(params['longitude']) : null;
      this.radiusKm = params['radiusKm'] ? parseInt(params['radiusKm']) : 500;
      this.fetchWarehouses(params);
    });
  }

  hasLocationCoords(): boolean {
    return this.userLat !== null && this.userLng !== null;
  }

  fetchWarehouses(params: any) {
    this.loading.set(true);
    this.http
      .get<ApiResponse<{ warehouses: Warehouse[] }>>(`${environment.apiUrl}/warehouses`, { params })
      .subscribe({
        next: (res) => {
          this.warehouses.set(res.data.warehouses || []);
          this.loading.set(false);
        },
        error: () => {
          this.warehouses.set([]);
          this.loading.set(false);
        },
      });
  }

  onFindNearest() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.locating.set(false);
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;
        this.selectedCity = ''; // Clear city text so proximity search matches all warehouses within radius
        this.applyFilters();
      },
      (err) => {
        this.locating.set(false);
        console.warn('Geolocation error:', err);
        alert('Could not access your location. Please ensure location permissions are enabled in your browser.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  selectCityFilter(city: string) {
    this.selectedCity = city;
    this.userLat = null; // Clear GPS coordinates when explicitly selecting a city hub
    this.userLng = null;
    this.applyFilters();
  }

  clearLocationFilter() {
    this.userLat = null;
    this.userLng = null;
    this.applyFilters();
  }

  resetAllFilters() {
    this.selectedCity = '';
    this.userLat = null;
    this.userLng = null;
    this.radiusKm = 500;
    this.router.navigate(['/warehouses']);
  }

  onWarehouseSelected(warehouseId: string) {
    this.hoveredWarehouseId = warehouseId;
    const element = document.getElementById(`warehouse-card-${warehouseId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  applyFilters() {
    const queryParams: any = {};
    if (this.selectedCity) queryParams.city = this.selectedCity;
    if (this.userLat !== null && this.userLng !== null) {
      queryParams.latitude = this.userLat;
      queryParams.longitude = this.userLng;
      queryParams.radiusKm = this.radiusKm;
    }

    this.router.navigate(['/warehouses'], { queryParams });
  }
}
