export type CapacityUnit = 'SQFT' | 'PALLET' | 'CUBIC_METER';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Currency = 'INR' | 'USD';

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Warehouse {
  _id: string;
  managerId: string | { _id: string; name: string; email: string; phone?: string };
  title: string;
  description: string;
  location: GeoLocation;
  address: Address;
  totalCapacity: number;
  capacityUnit: CapacityUnit;
  currency: Currency;
  pricePerUnitPerDay: number;
  minBookingDays: number;
  amenities: string[];
  images: string[];
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AvailabilityResult {
  warehouseId: string;
  warehouseTitle: string;
  capacityUnit: CapacityUnit;
  currency: Currency;
  totalCapacity: number;
  peakOccupied: number;
  availableCapacity: number;
  requestedQuantity: number;
  isAvailable: boolean;
  durationDays: number;
  pricePerUnitPerDay: number;
  estimatedTotal: number;
}
