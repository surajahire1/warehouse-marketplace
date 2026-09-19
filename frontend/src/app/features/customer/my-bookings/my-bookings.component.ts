import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Booking } from '../../../core/models/booking.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Storage Reservations</h1>
          <p class="text-sm text-gray-500 mt-1">Track active, upcoming, and past warehouse spaces.</p>
        </div>
        <a routerLink="/warehouses" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition">
          Book More Space
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
                  <th class="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (booking of bookings(); track booking._id) {
                  <tr class="hover:bg-gray-50/60 transition">
                    <td class="px-6 py-4 font-semibold text-gray-900">
                      {{ getWarehouseTitle(booking.warehouseId) }}
                    </td>
                    <td class="px-6 py-4 text-gray-600 text-xs">
                      {{ booking.startDate | date:'mediumDate' }} → {{ booking.endDate | date:'mediumDate' }}
                    </td>
                    <td class="px-6 py-4 font-medium text-gray-800">
                      {{ booking.quantityBooked }}
                    </td>
                    <td class="px-6 py-4 font-bold text-gray-900">
                      \${{ booking.totalAmount }}
                    </td>
                    <td class="px-6 py-4">
                      <app-status-badge [status]="booking.status" />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class MyBookingsComponent implements OnInit {
  private http = inject(HttpClient);

  bookings = signal<Booking[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.fetchBookings();
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

  getWarehouseTitle(warehouse: any): string {
    if (typeof warehouse === 'object' && warehouse?.title) {
      return warehouse.title;
    }
    return 'Warehouse Space';
  }
}
