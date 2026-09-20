import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="relative bg-gradient-to-b from-indigo-50/50 to-white pt-16 pb-24">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <span class="inline-block px-3.5 py-1.5 mb-6 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full">
          On-Demand Industrial Warehousing
        </span>
        <h1 class="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Flexible Storage Space, <br class="hidden sm:inline" />
          <span class="text-indigo-600">Exactly When & Where You Need It.</span>
        </h1>
        <p class="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Reserve square footage, pallet positions, or entire facilities on your terms. Real-time availability calculation, verified hosts, and instant online booking.
        </p>

        <!-- Search Bar Card -->
        <div class="mt-10 max-w-3xl mx-auto bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row gap-3">
          <div class="flex-1 text-left">
            <div class="flex justify-between items-center">
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">City or Location</label>
              <button 
                type="button" 
                (click)="onFindNearest()" 
                [disabled]="locating"
                class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition inline-flex items-center gap-1 disabled:opacity-50"
              >
                @if (locating) {
                  <span class="animate-spin">⏳</span> Locating...
                } @else {
                  <span>📍 Near Me (GPS)</span>
                }
              </button>
            </div>
            <input 
              type="text" 
              [(ngModel)]="searchCity" 
              placeholder="e.g. Mumbai, Bhiwandi, Gurugram, Bengaluru" 
              class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="w-full sm:w-48 text-left">
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Space Needed</label>
            <input 
              type="number" 
              [(ngModel)]="searchCapacity" 
              placeholder="Min. SqFt" 
              class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-end">
            <button 
              (click)="onSearch()" 
              class="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md transition"
            >
              Search Space
            </button>
          </div>
        </div>

        <!-- Quick Indian Logistics Hubs -->
        <div class="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span class="text-gray-400 font-medium">Popular Hubs:</span>
          <button 
            type="button"
            (click)="selectHub('Bhiwandi')"
            class="px-3 py-1 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-full text-gray-700 font-medium transition shadow-xs"
          >
            📍 Mumbai / Bhiwandi
          </button>
          <button 
            type="button"
            (click)="selectHub('Gurugram')"
            class="px-3 py-1 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-full text-gray-700 font-medium transition shadow-xs"
          >
            📍 Delhi-NCR / Gurugram
          </button>
          <button 
            type="button"
            (click)="selectHub('Hoskote')"
            class="px-3 py-1 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-full text-gray-700 font-medium transition shadow-xs"
          >
            📍 Bengaluru / Hoskote
          </button>
        </div>

        <!-- Value Props -->
        <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div class="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold mb-4">1</div>
            <h3 class="text-base font-bold text-gray-900">Geospatial Search</h3>
            <p class="mt-2 text-sm text-gray-500">Locate available space within 25km–50km radius of your supply chain nodes and fulfillment hubs.</p>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold mb-4">2</div>
            <h3 class="text-base font-bold text-gray-900">Dynamic Overlap Engine</h3>
            <p class="mt-2 text-sm text-gray-500">Only book what you need. Our capacity engine aggregates multi-tenant occupancy over your exact date range.</p>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div class="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold mb-4">3</div>
            <h3 class="text-base font-bold text-gray-900">Verified Hosts & KYC</h3>
            <p class="mt-2 text-sm text-gray-500">Every warehouse facility and operator undergoes business verification before accepting reservations.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  private router = inject(Router);
  searchCity = '';
  searchCapacity: number | null = null;
  locating = false;

  onSearch() {
    this.router.navigate(['/warehouses'], {
      queryParams: {
        city: this.searchCity || undefined,
        minCapacity: this.searchCapacity || undefined,
      },
    });
  }

  selectHub(hubCity: string) {
    this.searchCity = hubCity;
    this.onSearch();
  }

  onFindNearest() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    this.locating = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.locating = false;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.router.navigate(['/warehouses'], {
          queryParams: {
            latitude: lat,
            longitude: lng,
            radiusKm: 500,
          },
        });
      },
      (err) => {
        this.locating = false;
        console.warn('Geolocation error:', err);
        alert('Could not access your location. Please check browser permissions or search by city name.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }
}
