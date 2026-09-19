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

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  register(payload: { name: string; email: string; password: string; role?: string; phone?: string }): Observable<ApiResponse<AuthResponseData>> {
    return this.http.post<ApiResponse<AuthResponseData>>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((res) => this.handleAuthSuccess(res.data))
    );
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthResponseData>> {
    return this.http.post<ApiResponse<AuthResponseData>>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => this.handleAuthSuccess(res.data))
    );
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
