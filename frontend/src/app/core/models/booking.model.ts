import { Warehouse } from './warehouse.model';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'HELD_IN_ESCROW' | 'DISBURSED' | 'REFUNDED';

export interface Booking {
  _id: string;
  warehouseId: string | Warehouse;
  customerId: string | { _id: string; name: string; email: string; phone?: string };
  startDate: string;
  endDate: string;
  quantityBooked: number;
  currency?: 'INR' | 'USD';
  totalAmount: number;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentProvider?: string;
  paymentId?: string;
  orderId?: string;
  platformCommission?: number;
  hostPayoutAmount?: number;
  paidAt?: string;
  cancellationReason?: string;
  createdAt?: string;
}
