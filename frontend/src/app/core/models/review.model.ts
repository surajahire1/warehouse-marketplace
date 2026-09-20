export interface ReviewCustomer {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Review {
  _id: string;
  warehouseId: string | { _id: string; title: string; address?: any; images?: string[] };
  customerId: ReviewCustomer;
  bookingId: string;
  overallRating: number;
  dockSpeedRating: number;
  securityRating: number;
  cleanlinessRating: number;
  hostResponsivenessRating: number;
  facilityTypeUsed: string;
  comment: string;
  verifiedBooking: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewCategoryAverages {
  dockSpeed: number;
  security: number;
  cleanliness: number;
  hostResponsiveness: number;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  categories: ReviewCategoryAverages;
  distribution: RatingDistribution;
}

export interface WarehouseReviewsResponse {
  reviews: Review[];
  summary: ReviewSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateReviewPayload {
  bookingId: string;
  overallRating: number;
  dockSpeedRating?: number;
  securityRating?: number;
  cleanlinessRating?: number;
  hostResponsivenessRating?: number;
  facilityTypeUsed?: string;
  comment?: string;
}
