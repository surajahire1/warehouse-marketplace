import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Super Admin Governance</h1>
        <p class="text-sm text-gray-500 mt-1">Review pending warehouse host KYC documents and facility listings.</p>
      </div>

      <!-- Pending Verifications Queue -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <span class="font-bold text-sm text-gray-900">Pending KYC & Warehouse Approvals (3)</span>
          <span class="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">Requires Review</span>
        </div>

        <div class="divide-y divide-gray-100 text-sm">
          <div class="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-gray-900">Midwest Logistics Depot #4</span>
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">New Listing</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Host: Apex Storage LLC (EIN: 84-291823)</p>
              <p class="text-xs text-gray-600 mt-2">Location: Joliet, IL • Total Capacity: 45,000 SQFT • \$0.85/SQFT/day</p>
            </div>
            <div class="flex gap-2">
              <button class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition">
                Approve Listing
              </button>
              <button class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition border border-rose-200">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class VerificationsComponent {}
