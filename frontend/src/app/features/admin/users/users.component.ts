import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { User, UserRole } from '../../../core/models/user.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Registered Users</h1>
          <p class="text-sm text-gray-500 mt-1">View and manage all registered customers, warehouse hosts, and administrators.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
            Total Users: {{ users().length }}
          </span>
        </div>
      </div>

      <!-- Controls & Filter Bar -->
      <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <!-- Role Tabs -->
        <div class="flex gap-2">
          <button 
            type="button" 
            (click)="setFilter('')" 
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
            [ngClass]="selectedRole === '' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            All Users
          </button>
          <button 
            type="button" 
            (click)="setFilter('CUSTOMER')" 
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
            [ngClass]="selectedRole === 'CUSTOMER' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            Customers
          </button>
          <button 
            type="button" 
            (click)="setFilter('MANAGER')" 
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
            [ngClass]="selectedRole === 'MANAGER' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            Warehouse Hosts
          </button>
        </div>

        <!-- Search Input -->
        <div class="w-full sm:w-72">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="onSearch()" 
            placeholder="Search by name or email..." 
            class="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Users Table -->
      @if (loading()) {
        <div class="py-20 text-center text-xs text-gray-500">Loading registered users...</div>
      } @else if (users().length === 0) {
        <div class="py-20 text-center bg-white rounded-2xl border border-gray-200">
          <p class="text-sm text-gray-500">No users found matching your query.</p>
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                <tr>
                  <th class="px-6 py-3.5">User</th>
                  <th class="px-6 py-3.5">Account Role</th>
                  <th class="px-6 py-3.5">Phone Number</th>
                  <th class="px-6 py-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-xs">
                @for (user of users(); track user._id) {
                  <tr class="hover:bg-gray-50/50 transition">
                    <td class="px-6 py-4">
                      <div class="font-bold text-gray-900 text-sm">{{ user.name }}</div>
                      <div class="text-gray-500 text-xs">{{ user.email }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <span 
                        class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-blue-100 text-blue-800': user.role === 'CUSTOMER',
                          'bg-purple-100 text-purple-800': user.role === 'MANAGER',
                          'bg-emerald-100 text-emerald-800': user.role === 'ADMIN'
                        }"
                      >
                        {{ user.role === 'MANAGER' ? 'HOST / MANAGER' : user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-gray-600 font-medium">
                      {{ user.phone || '—' }}
                    </td>
                    <td class="px-6 py-4 text-gray-500">
                      {{ user.createdAt | date:'mediumDate' }}
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
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);

  users = signal<User[]>([]);
  loading = signal<boolean>(true);
  selectedRole = '';
  searchTerm = '';

  ngOnInit() {
    this.fetchUsers();
  }

  setFilter(role: string) {
    this.selectedRole = role;
    this.fetchUsers();
  }

  onSearch() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading.set(true);
    const params: any = {};
    if (this.selectedRole) params.role = this.selectedRole;
    if (this.searchTerm) params.search = this.searchTerm;

    this.http.get<ApiResponse<User[]>>(`${environment.apiUrl}/admin/users`, { params }).subscribe({
      next: (res) => {
        this.users.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.loading.set(false);
      },
    });
  }
}
