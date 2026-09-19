import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Warehouse, CapacityUnit, Currency } from '../../../core/models/warehouse.model';

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
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing() ? 'Edit Warehouse Facility' : 'List a New Warehouse Facility' }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          {{ isEditing() ? 'Update facility photos, capacity, pricing, or amenities.' : 'Provide facility specifications, coordinates, and pricing to list on the marketplace.' }}
        </p>
      </div>

      @if (errorMessage()) {
        <div class="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {{ errorMessage() }}
        </div>
      }

      @if (loadingExisting()) {
        <div class="py-20 text-center text-sm text-gray-500">Loading existing facility details...</div>
      } @else {
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
                  placeholder="e.g. Bhiwandi Grade-A Logistics Park" 
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
                  placeholder="Plot 45-B, Mumbai-Nashik Expressway, Mankoli Naka" 
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
                  placeholder="Bhiwandi" 
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
                  placeholder="Maharashtra" 
                  class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700">Postal / PIN Code *</label>
                <input 
                  type="text" 
                  [(ngModel)]="address.postalCode" 
                  name="postalCode" 
                  required 
                  placeholder="421302" 
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
                  placeholder="India" 
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
                    placeholder="19.2967" 
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
                    placeholder="73.0631" 
                    class="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Capacity & Pricing with Currency Options -->
          <div>
            <h2 class="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">3. Capacity & Rental Pricing</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700">Total Capacity *</label>
                <input 
                  type="number" 
                  [(ngModel)]="totalCapacity" 
                  name="totalCapacity" 
                  min="1"
                  required 
                  placeholder="35000" 
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
                <label class="block text-xs font-semibold text-gray-700">Billing Currency *</label>
                <select 
                  [(ngModel)]="currency" 
                  name="currency" 
                  class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-semibold text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700">Daily Rate ({{ currency === 'USD' ? '$' : '₹' }}) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  [(ngModel)]="pricePerUnitPerDay" 
                  name="pricePerUnitPerDay" 
                  min="0.01"
                  required 
                  placeholder="25.50" 
                  class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
            </div>
            <div class="mt-4 w-full sm:w-1/2">
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

          <!-- Section 5: Photos (Add, Change, or Remove Images) -->
          <div>
            <div class="flex justify-between items-baseline mb-2 pb-2 border-b border-gray-100">
              <h2 class="text-base font-bold text-gray-900">5. Facility Photos (Image URLs)</h2>
              <span class="text-xs text-gray-500">{{ images.length }} photo(s) attached</span>
            </div>
            
            <p class="text-xs text-gray-500 mb-4">
              Add image links or remove outdated ones below. You can change photos anytime after publishing.
            </p>

            <div class="flex gap-2 mb-4">
              <input 
                type="url" 
                [(ngModel)]="newImageUrl" 
                name="newImageUrl" 
                placeholder="Paste new image URL (e.g. https://images.unsplash.com/...)" 
                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              />
              <button 
                type="button" 
                (click)="addImage()" 
                class="px-5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition border border-indigo-200"
              >
                + Add Photo
              </button>
            </div>

            @if (images.length > 0) {
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                @for (img of images; track $index) {
                  <div class="relative h-28 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50 shadow-sm">
                    <img [src]="img" class="w-full h-full object-cover" />
                    <!-- Action Overlay -->
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        (click)="removeImage($index)" 
                        title="Delete photo"
                        class="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold shadow transition flex items-center gap-1"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                No photos currently attached to this facility. Paste an image URL above to add one.
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
              {{ loading() ? 'Saving...' : (isEditing() ? 'Save Changes' : 'Publish Warehouse Listing') }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class WarehouseEditorComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditing = signal<boolean>(false);
  warehouseId = signal<string | null>(null);
  loadingExisting = signal<boolean>(false);

  title = '';
  description = '';
  latitude: number = 19.2967;
  longitude: number = 73.0631;
  address = {
    street: '',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    postalCode: '421302',
    country: 'India',
  };
  totalCapacity: number = 35000;
  capacityUnit: CapacityUnit = 'SQFT';
  currency: Currency = 'INR';
  pricePerUnitPerDay: number = 25.50;
  minBookingDays: number = 7;

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
  selectedAmenities: string[] = ['24/7 Security', 'Loading Docks', 'Forklift On-Site', 'CCTV 24/7'];

  images: string[] = [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  ];
  newImageUrl = '';

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.warehouseId.set(id);
      this.loadWarehouseDetails(id);
    }
  }

  loadWarehouseDetails(id: string) {
    this.loadingExisting.set(true);
    this.http.get<ApiResponse<Warehouse>>(`${environment.apiUrl}/warehouses/${id}`).subscribe({
      next: (res) => {
        const w = res.data;
        this.title = w.title;
        this.description = w.description;
        this.address = {
          street: w.address.street,
          city: w.address.city,
          state: w.address.state,
          postalCode: w.address.postalCode,
          country: w.address.country,
        };
        if (w.location?.coordinates && w.location.coordinates.length === 2) {
          this.longitude = w.location.coordinates[0];
          this.latitude = w.location.coordinates[1];
        }
        this.totalCapacity = w.totalCapacity;
        this.capacityUnit = w.capacityUnit;
        this.currency = w.currency || 'INR';
        this.pricePerUnitPerDay = w.pricePerUnitPerDay;
        this.minBookingDays = w.minBookingDays;
        this.selectedAmenities = w.amenities || [];
        this.images = [...(w.images || [])];
        this.loadingExisting.set(false);
      },
      error: (err) => {
        this.loadingExisting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load existing warehouse details.');
      },
    });
  }

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
      currency: this.currency,
      pricePerUnitPerDay: Number(this.pricePerUnitPerDay),
      minBookingDays: Number(this.minBookingDays),
      amenities: this.selectedAmenities,
      images: this.images,
    };

    const request$ = this.isEditing()
      ? this.http.put<ApiResponse<Warehouse>>(`${environment.apiUrl}/warehouses/${this.warehouseId()}`, payload)
      : this.http.post<ApiResponse<Warehouse>>(`${environment.apiUrl}/warehouses`, payload);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        const msg = this.isEditing() ? 'Warehouse updated successfully!' : 'Warehouse submitted successfully!';
        alert(msg);
        this.router.navigate(['/manager/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.message || err.error?.errors?.join(', ') || 'Failed to save warehouse listing.'
        );
      },
    });
  }
}
