import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Warehouse, CapacityUnit } from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-warehouse-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Breadcrumb & Header -->
      <div class="mb-8">
        <a routerLink="/manager/dashboard" class="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 mb-2">
          ← Back to Host Dashboard
        </a>
        <h1 class="text-2xl font-bold text-gray-900">List a New Warehouse Facility</h1>
        <p class="text-sm text-gray-500 mt-1">Provide facility specifications, coordinates, and pricing to list on the marketplace.</p>
      </div>

      @if (errorMessage()) {
        <div class="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {{ errorMessage() }}
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8">
        <!-- Section 1: Basic Information -->
        <div>
          <h2 class="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">1. Basic Facility Information</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700">Warehouse Name / Title *</label>
              <input 
                type="text" 
                [(ngModel)]="title" 
                name="title" 
                required 
                placeholder="e.g. O'Hare Logistics Center Bay 4" 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700">Description *</label>
              <textarea 
                [(ngModel)]="description" 
                name="description" 
                rows="4" 
                required 
                placeholder="Describe access doors, clear heights, sprinkler systems, security features, etc." 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Section 2: Address & Coordinates -->
        <div>
          <h2 class="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">2. Location & Geospatial Coordinates</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-gray-700">Street Address *</label>
              <input 
                type="text" 
                [(ngModel)]="address.street" 
                name="street" 
                required 
                placeholder="123 Industrial Parkway" 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700">City *</label>
              <input 
                type="text" 
                [(ngModel)]="address.city" 
                name="city" 
                required 
                placeholder="Chicago" 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700">State / Region *</label>
              <input 
                type="text" 
                [(ngModel)]="address.state" 
                name="state" 
                required 
                placeholder="IL" 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700">Postal / ZIP Code *</label>
              <input 
                type="text" 
                [(ngModel)]="address.postalCode" 
                name="postalCode" 
                required 
                placeholder="60601" 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700">Country *</label>
              <input 
                type="text" 
                [(ngModel)]="address.country" 
                name="country" 
                required 
                placeholder="US" 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>

          <!-- GPS Coordinates (required for MongoDB 2dsphere indexing) -->
          <div class="mt-4 p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-bold text-indigo-900">GPS Coordinates (for Proximity Search) *</span>
              <button 
                type="button" 
                (click)="useCurrentLocation()" 
                class="text-xs text-indigo-600 font-semibold hover:underline"
              >
                📍 Use My Current Location
              </button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600">Latitude (-90 to 90)</label>
                <input 
                  type="number" 
                  step="any"
                  [(ngModel)]="latitude" 
                  name="latitude" 
                  required 
                  placeholder="41.8781" 
                  class="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
              <div>
                <label class="block text-xs text-gray-600">Longitude (-180 to 180)</label>
                <input 
                  type="number" 
                  step="any"
                  [(ngModel)]="longitude" 
                  name="longitude" 
                  required 
                  placeholder="-87.6298" 
                  class="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Capacity & Pricing -->
        <div>
          <h2 class="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">3. Capacity & Rental Pricing</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700">Total Capacity *</label>
              <input 
                type="number" 
                [(ngModel)]="totalCapacity" 
                name="totalCapacity" 
                min="1"
                required 
                placeholder="e.g. 25000" 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700">Capacity Unit *</label>
              <select 
                [(ngModel)]="capacityUnit" 
                name="capacityUnit" 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="SQFT">Square Feet (SQFT)</option>
                <option value="PALLET">Pallets (PALLET)</option>
                <option value="CUBIC_METER">Cubic Meters (CBM)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700">Daily Rate (\$) *</label>
              <input 
                type="number" 
                step="0.01"
                [(ngModel)]="pricePerUnitPerDay" 
                name="pricePerUnitPerDay" 
                min="0.01"
                required 
                placeholder="0.85" 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700">Min. Booking Days</label>
              <input 
                type="number" 
                [(ngModel)]="minBookingDays" 
                name="minBookingDays" 
                min="1"
                required 
                class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
            </div>
          </div>
        </div>

        <!-- Section 4: Amenities -->
        <div>
          <h2 class="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">4. Facility Amenities</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            @for (item of availableAmenities; track item) {
              <label class="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                     [ngClass]="{'bg-indigo-50/70 border-indigo-200 text-indigo-900': isAmenitySelected(item)}">
                <input 
                  type="checkbox" 
                  [checked]="isAmenitySelected(item)" 
                  (change)="toggleAmenity(item)" 
                  class="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{{ item }}</span>
              </label>
            }
          </div>
        </div>

        <!-- Section 5: Photos -->
        <div>
          <h2 class="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">5. Facility Photos (Image URLs)</h2>
          <div class="flex gap-2 mb-3">
            <input 
              type="url" 
              [(ngModel)]="newImageUrl" 
              name="newImageUrl" 
              placeholder="https://images.unsplash.com/photo-..." 
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            />
            <button 
              type="button" 
              (click)="addImage()" 
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
            >
              + Add URL
            </button>
          </div>

          @if (images.length > 0) {
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              @for (img of images; track $index) {
                <div class="relative h-24 rounded-lg overflow-hidden border border-gray-200 group">
                  <img [src]="img" class="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    (click)="removeImage($index)" 
                    class="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Action Buttons -->
        <div class="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <a 
            routerLink="/manager/dashboard" 
            class="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </a>
          <button 
            type="submit" 
            [disabled]="loading()" 
            class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {{ loading() ? 'Submitting Listing...' : 'Publish Warehouse Listing' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class WarehouseEditorComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  title = '';
  description = '';
  latitude: number = 41.8781;
  longitude: number = -87.6298;
  address = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  };
  totalCapacity: number = 20000;
  capacityUnit: 'SQFT' | 'PALLET' | 'CUBIC_METER' = 'SQFT';
  pricePerUnitPerDay: number = 0.85;
  minBookingDays: number = 1;

  availableAmenities: string[] = [
    '24/7 Security',
    'Loading Docks',
    'Forklift On-Site',
    'Climate Controlled',
    'Cold Storage',
    'Sprinkler System',
    'CCTV 24/7',
    'EV Truck Charging',
    'Bonded Storage',
    'Container Yard',
    'Rail Access',
    'Heavy Floor Load',
  ];
  selectedAmenities: string[] = ['24/7 Security', 'Loading Docks', 'Forklift On-Site'];

  images: string[] = [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  ];
  newImageUrl = '';

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  isAmenitySelected(item: string): boolean {
    return this.selectedAmenities.includes(item);
  }

  toggleAmenity(item: string) {
    if (this.isAmenitySelected(item)) {
      this.selectedAmenities = this.selectedAmenities.filter((a) => a !== item);
    } else {
      this.selectedAmenities.push(item);
    }
  }

  addImage() {
    if (this.newImageUrl.trim()) {
      this.images.push(this.newImageUrl.trim());
      this.newImageUrl = '';
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitude = parseFloat(pos.coords.latitude.toFixed(4));
          this.longitude = parseFloat(pos.coords.longitude.toFixed(4));
        },
        (err) => {
          alert('Could not retrieve current location: ' + err.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    const payload = {
      title: this.title,
      description: this.description,
      latitude: Number(this.latitude),
      longitude: Number(this.longitude),
      address: this.address,
      totalCapacity: Number(this.totalCapacity),
      capacityUnit: this.capacityUnit,
      pricePerUnitPerDay: Number(this.pricePerUnitPerDay),
      minBookingDays: Number(this.minBookingDays),
      amenities: this.selectedAmenities,
      images: this.images,
    };

    this.http.post<ApiResponse<Warehouse>>(`${environment.apiUrl}/warehouses`, payload).subscribe({
      next: () => {
        this.loading.set(false);
        alert('Warehouse submitted successfully! It is now pending verification.');
        this.router.navigate(['/manager/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.message || err.error?.errors?.join(', ') || 'Failed to create warehouse listing.'
        );
      },
    });
  }
}
