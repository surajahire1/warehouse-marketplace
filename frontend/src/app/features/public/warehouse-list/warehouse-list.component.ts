import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Warehouse } from '../../../core/models/warehouse.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CapacityGaugeComponent } from '../../../shared/components/capacity-gauge/capacity-gauge.component';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CapacityGaugeComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Available Warehouses</h1>
          <p class="text-sm text-gray-500 mt-1">Browse verified commercial facilities with live capacity.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="py-20 text-center text-gray-500">Loading warehouses...</div>
      } @else if (warehouses().length === 0) {
        <div class="py-20 text-center bg-white rounded-xl border border-gray-200">
          <p class="text-gray-500 font-medium">No warehouses match your current search filters.</p>
          <a routerLink="/" class="mt-4 inline-block text-sm text-indigo-600 font-semibold hover:underline">Reset Filters</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (warehouse of warehouses(); track warehouse._id) {
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
              <div class="h-44 bg-gray-100 relative">
                @if (warehouse.images && warehouse.images.length > 0) {
                  <img [src]="warehouse.images[0]" [alt]="warehouse.title" class="w-full h-full object-cover" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo Provided</div>
                }
                <span class="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-xs font-bold text-gray-900 shadow">
                  {{ warehouse.currency === 'USD' ? '$' : '₹' }}{{ warehouse.pricePerUnitPerDay }}/{{ warehouse.capacityUnit }}/day
                </span>
              </div>

              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-gray-900 text-base leading-tight">{{ warehouse.title }}</h3>
                  <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <span>📍</span> {{ warehouse.address.city }}, {{ warehouse.address.state }}
                  </p>
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
    </div>
  `,
})
export class WarehouseListComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  warehouses = signal<Warehouse[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.fetchWarehouses(params);
    });
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
}
