import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inquiry } from '../models/inquiry.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inquiries`;

  /**
   * Retrieves or initializes an inquiry thread for a specific warehouse.
   */
  getWarehouseInquiry(warehouseId: string): Observable<ApiResponse<Inquiry>> {
    return this.http.get<ApiResponse<Inquiry>>(`${this.apiUrl}/warehouse/${warehouseId}`);
  }

  /**
   * Retrieves an inquiry by its unique conversation ID.
   */
  getInquiryById(inquiryId: string): Observable<ApiResponse<Inquiry>> {
    return this.http.get<ApiResponse<Inquiry>>(`${this.apiUrl}/${inquiryId}`);
  }

  /**
   * Sends a new message in an inquiry thread.
   */
  sendMessage(inquiryId: string, text: string): Observable<ApiResponse<Inquiry>> {
    return this.http.post<ApiResponse<Inquiry>>(`${this.apiUrl}/${inquiryId}/messages`, { text });
  }

  /**
   * Retrieves all inquiry conversations for the logged-in customer.
   */
  getMyInquiries(): Observable<ApiResponse<Inquiry[]>> {
    return this.http.get<ApiResponse<Inquiry[]>>(`${this.apiUrl}/user/my`);
  }

  /**
   * Retrieves host inbox inquiries across all facilities.
   */
  getManagerInbox(): Observable<ApiResponse<Inquiry[]>> {
    return this.http.get<ApiResponse<Inquiry[]>>(`${this.apiUrl}/host/inbox`);
  }

  /**
   * Marks an inquiry thread as read.
   */
  markAsRead(inquiryId: string): Observable<ApiResponse<Inquiry>> {
    return this.http.patch<ApiResponse<Inquiry>>(`${this.apiUrl}/${inquiryId}/read`, {});
  }
}
