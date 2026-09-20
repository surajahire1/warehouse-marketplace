import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Review,
  WarehouseReviewsResponse,
  CreateReviewPayload,
} from '../models/review.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reviews`;

  /**
   * Retrieves paginated reviews and summary category metrics for a facility.
   */
  getWarehouseReviews(warehouseId: string, page: number = 1, limit: number = 10): Observable<ApiResponse<WarehouseReviewsResponse>> {
    return this.http.get<ApiResponse<WarehouseReviewsResponse>>(`${this.apiUrl}/warehouse/${warehouseId}`, {
      params: { page, limit },
    });
  }

  /**
   * Submits a verified review for a booking.
   */
  submitReview(payload: CreateReviewPayload): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.apiUrl}`, payload);
  }

  /**
   * Checks if customer already reviewed a booking.
   */
  getBookingReview(bookingId: string): Observable<ApiResponse<Review | null>> {
    return this.http.get<ApiResponse<Review | null>>(`${this.apiUrl}/booking/${bookingId}`);
  }

  /**
   * Retrieves all reviews written by current customer.
   */
  getMyReviews(): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.apiUrl}/user/my`);
  }
}
