import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponseData } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Modern Angular Signals for reactive state
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly token = signal<string | null>(localStorage.getItem('token'));

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role || null);
  readonly isCustomer = computed(() => this.currentUser()?.role === 'CUSTOMER');
  readonly isManager = computed(() => this.currentUser()?.role === 'MANAGER');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly hasPhone = computed(() => !!this.currentUser()?.phone?.trim());

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  register(payload: { email: string; password: string; phone: string; role?: string; name?: string }): Observable<ApiResponse<AuthResponseData>> {
    return this.http.post<ApiResponse<AuthResponseData>>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((res) => this.handleAuthSuccess(res.data))
    );
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthResponseData>> {
    return this.http.post<ApiResponse<AuthResponseData>>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => this.handleAuthSuccess(res.data))
    );
  }

  updateProfile(payload: { name?: string; phone?: string; dob?: string }): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${environment.apiUrl}/auth/profile`, payload).pipe(
      tap((res) => {
        if (res.data) {
          localStorage.setItem('user', JSON.stringify(res.data));
          this.currentUser.set(res.data);
        }
      })
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>(`${environment.apiUrl}/auth/change-password`, payload);
  }

  private handleAuthSuccess(data: AuthResponseData) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.token.set(data.token);
    this.currentUser.set(data.user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
