import { Warehouse } from './warehouse.model';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  _id: string;
  warehouseId: string | Warehouse;
  customerId: string;
  startDate: string;
  endDate: string;
  quantityBooked: number;
  currency?: 'INR' | 'USD';
  totalAmount: number;
  status: BookingStatus;
  cancellationReason?: string;
  paymentId?: string;
  createdAt?: string;
}
