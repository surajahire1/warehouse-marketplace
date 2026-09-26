import { Component, Input, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Warehouse } from '../../../core/models/warehouse.model';

export interface MonthlyDataPoint {
  key: string;
  label: string;
  grossRevenue: number;
  netPayout: number;
  bookingCount: number;
}

export interface FacilityOccupancy {
  warehouseId: string;
  title: string;
  city: string;
  totalCapacity: number;
  capacityUnit: string;
  currentOccupied: number;
  availableCapacity: number;
  occupancyRate: number;
  activeBookingsCount: number;
}

export interface AnalyticsSummary {
  totalGrossRevenue: number;
  totalNetPayout: number;
  portfolioTotalCapacity: number;
  portfolioOccupied: number;
  portfolioOccupancyRate: number;
  avgDurationDays: number;
  totalBookings: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  conversionRate: number;
}

export interface AnalyticsResponse {
  period: string;
  summary: AnalyticsSummary;
  monthlySeries: MonthlyDataPoint[];
  warehouseOccupancy: FacilityOccupancy[];
}

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 space-y-6">
      <!-- Header Controls: Title & Period Filters -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-gray-900">Revenue & Occupancy Performance</h2>
            <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-indigo-100">
              Live Analytics
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Real-time multi-tenant occupancy, payout trends, and booking turnaround metrics.
          </p>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <!-- Facility Filter Dropdown -->
          @if (warehouses.length > 1) {
            <select
              [(ngModel)]="selectedWarehouseId"
              (change)="onFilterChange()"
              class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Facilities ({{ warehouses.length }})</option>
              @for (wh of warehouses; track wh._id) {
                <option [value]="wh._id">{{ wh.title }}</option>
              }
            </select>
          }

          <!-- Metric Display Mode Toggle -->
          <div class="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              (click)="metricMode = 'net'"
              class="px-2.5 py-1 rounded-md font-bold transition"
              [ngClass]="metricMode === 'net' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
            >
              Net Payout
            </button>
            <button
              type="button"
              (click)="metricMode = 'gross'"
              class="px-2.5 py-1 rounded-md font-bold transition"
              [ngClass]="metricMode === 'gross' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
            >
              Gross Revenue
            </button>
          </div>

          <!-- Time Range Selector -->
          <div class="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              (click)="setPeriod('30d')"
              class="px-2.5 py-1 rounded-md font-bold transition"
              [ngClass]="selectedPeriod === '30d' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
            >
              30D
            </button>
            <button
              type="button"
              (click)="setPeriod('6m')"
              class="px-2.5 py-1 rounded-md font-bold transition"
              [ngClass]="selectedPeriod === '6m' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
            >
              6M
            </button>
            <button
              type="button"
              (click)="setPeriod('1y')"
              class="px-2.5 py-1 rounded-md font-bold transition"
              [ngClass]="selectedPeriod === '1y' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
            >
              1Y
            </button>
            <button
              type="button"
              (click)="setPeriod('all')"
              class="px-2.5 py-1 rounded-md font-bold transition"
              [ngClass]="selectedPeriod === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
            >
              All
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Executive Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- 1. Total Earnings -->
        <div class="p-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/40 rounded-xl border border-indigo-100/80">
          <span class="text-[11px] font-bold uppercase text-indigo-700 tracking-wider block">
            {{ metricMode === 'net' ? 'Net Host Earnings' : 'Gross Marketplace Volume' }}
          </span>
          <div class="mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span class="text-2xl sm:text-3xl font-black text-gray-900">
              ₹{{ (metricMode === 'net' ? summary().totalNetPayout : summary().totalGrossRevenue).toLocaleString() }}
            </span>
          </div>
          <span class="text-[10px] text-gray-500 mt-1 block">
            Escrow protected • {{ summary().confirmedCount }} confirmed bookings
          </span>
        </div>

        <!-- 2. Portfolio Occupancy Rate -->
        <div class="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-xl border border-emerald-100/80">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase text-emerald-800 tracking-wider block">
              Portfolio Occupancy
            </span>
            <span 
              class="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase"
              [ngClass]="{
                'bg-emerald-200 text-emerald-900': summary().portfolioOccupancyRate >= 70,
                'bg-amber-100 text-amber-900': summary().portfolioOccupancyRate < 70 && summary().portfolioOccupancyRate >= 30,
                'bg-gray-100 text-gray-700': summary().portfolioOccupancyRate < 30
              }"
            >
              {{ summary().portfolioOccupancyRate >= 70 ? 'High' : summary().portfolioOccupancyRate >= 30 ? 'Optimal' : 'Low' }}
            </span>
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-2xl sm:text-3xl font-black text-gray-900">
              {{ summary().portfolioOccupancyRate }}%
            </span>
            <span class="text-xs text-gray-500 font-medium">utilized</span>
          </div>
          <!-- Mini Progress Bar -->
          <div class="w-full bg-emerald-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              class="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              [style.width.%]="summary().portfolioOccupancyRate"
            ></div>
          </div>
        </div>

        <!-- 3. Average Duration -->
        <div class="p-4 bg-gradient-to-br from-purple-50/70 to-fuchsia-50/40 rounded-xl border border-purple-100/80">
          <span class="text-[11px] font-bold uppercase text-purple-700 tracking-wider block">
            Avg. Booking Length
          </span>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-2xl sm:text-3xl font-black text-gray-900">
              {{ summary().avgDurationDays }}
            </span>
            <span class="text-xs text-gray-500 font-medium">Days / reservation</span>
          </div>
          <span class="text-[10px] text-gray-500 mt-1 block">
            Longer terms reduce turnover costs
          </span>
        </div>

        <!-- 4. Conversion & Approval Rate -->
        <div class="p-4 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-xl border border-amber-100/80">
          <span class="text-[11px] font-bold uppercase text-amber-800 tracking-wider block">
            Host Acceptance Rate
          </span>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-2xl sm:text-3xl font-black text-gray-900">
              {{ summary().conversionRate }}%
            </span>
            <span class="text-xs text-gray-500 font-medium">approved</span>
          </div>
          <span class="text-[10px] text-gray-500 mt-1 block">
            {{ summary().pendingCount }} pending • {{ summary().cancelledCount }} cancelled
          </span>
        </div>
      </div>

      <!-- Main Interactive Revenue Trend Chart (SVG / Responsive) -->
      <div class="p-5 bg-gray-50/60 rounded-2xl border border-gray-100 space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 class="text-sm font-bold text-gray-900">
              Monthly Revenue Trajectory ({{ metricMode === 'net' ? 'Net Payout' : 'Gross Value' }})
            </h3>
            <p class="text-xs text-gray-500">
              Tap or hover any monthly bar to inspect reservation breakdown.
            </p>
          </div>

          <!-- Active Selected Point Tooltip Pill -->
          @if (activePoint) {
            <div class="px-3 py-1.5 bg-white border border-indigo-200 rounded-xl shadow-xs text-xs text-gray-700 flex items-center gap-2 animate-in fade-in duration-100">
              <span class="font-bold text-indigo-700">{{ activePoint.label }}:</span>
              <span>₹{{ (metricMode === 'net' ? activePoint.netPayout : activePoint.grossRevenue).toLocaleString() }}</span>
              <span class="text-gray-400">•</span>
              <span class="text-gray-500">{{ activePoint.bookingCount }} booking{{ activePoint.bookingCount === 1 ? '' : 's' }}</span>
            </div>
          }
        </div>

        <!-- Interactive Bar Visualization -->
        <div class="w-full pt-4 pb-2">
          @if (monthlySeries().length === 0) {
            <div class="py-12 text-center text-xs text-gray-400">
              No revenue records for the selected period.
            </div>
          } @else {
            <div class="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-gray-200 pb-2">
              @for (point of monthlySeries(); track point.key) {
                <div 
                  class="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  (mouseenter)="activePoint = point"
                  (mouseleave)="activePoint = null"
                  (click)="activePoint = point"
                >
                  <!-- Tooltip Popover on Hover -->
                  @if (activePoint?.key === point.key) {
                    <div class="absolute -top-12 bg-gray-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg z-20 pointer-events-none">
                      ₹{{ (metricMode === 'net' ? point.netPayout : point.grossRevenue).toLocaleString() }}
                      <div class="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                    </div>
                  }

                  <!-- Value Tag above bar -->
                  <span class="text-[10px] font-bold text-gray-500 mb-1 transition group-hover:text-indigo-600 hidden sm:block">
                    ₹{{ formatCompact(metricMode === 'net' ? point.netPayout : point.grossRevenue) }}
                  </span>

                  <!-- Bar -->
                  <div 
                    class="w-full max-w-[42px] rounded-t-lg transition-all duration-300 relative overflow-hidden"
                    [ngClass]="activePoint?.key === point.key 
                      ? 'bg-indigo-600 shadow-md ring-2 ring-indigo-400/40' 
                      : (point.grossRevenue > 0 ? 'bg-gradient-to-t from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500' : 'bg-gray-200/70')"
                    [style.height.%]="getBarHeightPercent(metricMode === 'net' ? point.netPayout : point.grossRevenue)"
                  ></div>

                  <!-- X-Axis Month Label -->
                  <span class="text-[11px] font-semibold text-gray-600 mt-2 truncate w-full text-center">
                    {{ point.label }}
                  </span>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Facility-Specific Capacity Utilization Grid -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-gray-900">Facility-Level Space Utilization</h3>
          <span class="text-xs text-gray-500">Live active reservation overlap</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          @for (item of facilityOccupancies(); track item.warehouseId) {
            <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2.5">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="font-bold text-xs text-gray-900 leading-snug">{{ item.title }}</h4>
                  <p class="text-[11px] text-gray-500">📍 {{ item.city }}</p>
                </div>
                <span 
                  class="text-[10px] font-black px-2 py-0.5 rounded-full"
                  [ngClass]="{
                    'bg-emerald-100 text-emerald-800': item.occupancyRate >= 70,
                    'bg-indigo-100 text-indigo-800': item.occupancyRate < 70 && item.occupancyRate >= 30,
                    'bg-gray-100 text-gray-600': item.occupancyRate < 30
                  }"
                >
                  {{ item.occupancyRate }}% Occupied
                </span>
              </div>

              <!-- Occupancy Bar -->
              <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  class="h-2 rounded-full transition-all duration-500"
                  [ngClass]="{
                    'bg-emerald-500': item.occupancyRate >= 70,
                    'bg-indigo-500': item.occupancyRate < 70 && item.occupancyRate >= 30,
                    'bg-amber-500': item.occupancyRate < 30
                  }"
                  [style.width.%]="item.occupancyRate"
                ></div>
              </div>

              <div class="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                <span>Booked: <strong>{{ item.currentOccupied.toLocaleString() }} {{ item.capacityUnit }}</strong></span>
                <span>Available: <strong>{{ item.availableCapacity.toLocaleString() }} {{ item.capacityUnit }}</strong></span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AnalyticsChartComponent implements OnChanges {
  @Input() warehouses: Warehouse[] = [];
  @Input() bookings: any[] = [];

  private http = inject(HttpClient);

  selectedPeriod = '6m';
  selectedWarehouseId = '';
  metricMode: 'net' | 'gross' = 'net';

  activePoint: MonthlyDataPoint | null = null;
  loading = signal<boolean>(false);

  summary = signal<AnalyticsSummary>({
    totalGrossRevenue: 0,
    totalNetPayout: 0,
    portfolioTotalCapacity: 0,
    portfolioOccupied: 0,
    portfolioOccupancyRate: 0,
    avgDurationDays: 0,
    totalBookings: 0,
    confirmedCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
    conversionRate: 100,
  });

  monthlySeries = signal<MonthlyDataPoint[]>([]);
  facilityOccupancies = signal<FacilityOccupancy[]>([]);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['warehouses'] || changes['bookings']) {
      this.fetchAnalytics();
    }
  }

  setPeriod(period: string) {
    this.selectedPeriod = period;
    this.fetchAnalytics();
  }

  onFilterChange() {
    this.fetchAnalytics();
  }

  fetchAnalytics() {
    this.loading.set(true);
    let url = `${environment.apiUrl}/analytics/manager?period=${this.selectedPeriod}`;
    if (this.selectedWarehouseId) {
      url += `&warehouseId=${this.selectedWarehouseId}`;
    }

    this.http.get<ApiResponse<AnalyticsResponse>>(url).subscribe({
      next: (res) => {
        if (res.data) {
          this.summary.set(res.data.summary);
          this.monthlySeries.set(res.data.monthlySeries || []);
          this.facilityOccupancies.set(res.data.warehouseOccupancy || []);
        }
        this.loading.set(false);
      },
      error: () => {
        // Fallback: compute client-side from input signals if backend is unreachable
        this.computeClientSideAnalytics();
        this.loading.set(false);
      },
    });
  }

  private computeClientSideAnalytics() {
    const now = new Date();
    const confirmed = this.bookings.filter(
      (b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE' || b.status === 'COMPLETED'
    );

    const totalGross = confirmed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalNet = confirmed.reduce((sum, b) => sum + (b.hostPayoutAmount || Math.round((b.totalAmount || 0) * 0.9)), 0);

    // Compute duration
    let durSum = 0;
    let durCount = 0;
    for (const b of confirmed) {
      if (b.startDate && b.endDate) {
        const d = Math.max(1, Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86400000));
        durSum += d;
        durCount++;
      }
    }
    const avgDuration = durCount > 0 ? Math.round((durSum / durCount) * 10) / 10 : 0;

    // Facility occupancies
    const occupancies: FacilityOccupancy[] = this.warehouses.map((w) => {
      const active = confirmed.filter((b) => {
        const matches = b.warehouseId?._id === w._id || b.warehouseId === w._id;
        const inDates = new Date(b.startDate) <= now && new Date(b.endDate) >= now;
        return matches && inDates;
      });
      const currentOccupied = active.reduce((sum, b) => sum + (b.quantityBooked || 0), 0);
      const rate = w.totalCapacity > 0 ? Math.min(100, Math.round((currentOccupied / w.totalCapacity) * 100)) : 0;
      return {
        warehouseId: w._id,
        title: w.title,
        city: w.address?.city || '',
        totalCapacity: w.totalCapacity,
        capacityUnit: w.capacityUnit,
        currentOccupied,
        availableCapacity: Math.max(0, w.totalCapacity - currentOccupied),
        occupancyRate: rate,
        activeBookingsCount: active.length,
      };
    });

    const totalCap = occupancies.reduce((sum, o) => sum + o.totalCapacity, 0);
    const totalOcc = occupancies.reduce((sum, o) => sum + o.currentOccupied, 0);
    const portRate = totalCap > 0 ? Math.min(100, Math.round((totalOcc / totalCap) * 100)) : 0;

    this.summary.set({
      totalGrossRevenue: totalGross,
      totalNetPayout: totalNet,
      portfolioTotalCapacity: totalCap,
      portfolioOccupied: totalOcc,
      portfolioOccupancyRate: portRate,
      avgDurationDays: avgDuration,
      totalBookings: this.bookings.length,
      confirmedCount: confirmed.length,
      pendingCount: this.bookings.filter((b) => b.status === 'PENDING').length,
      cancelledCount: this.bookings.filter((b) => b.status === 'CANCELLED').length,
      conversionRate: 95,
    });

    this.facilityOccupancies.set(occupancies);
  }

  getBarHeightPercent(value: number): number {
    const points = this.monthlySeries();
    if (points.length === 0) return 0;
    const maxVal = Math.max(
      ...points.map((p) => (this.metricMode === 'net' ? p.netPayout : p.grossRevenue)),
      1
    );
    if (value <= 0) return 4; // minimum visible bar base
    return Math.max(8, Math.round((value / maxVal) * 92));
  }

  formatCompact(val: number): string {
    if (val >= 10000000) return (val / 10000000).toFixed(1) + 'Cr';
    if (val >= 100000) return (val / 100000).toFixed(1) + 'L';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toString();
  }
}
