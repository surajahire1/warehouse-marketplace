export interface InquiryMessage {
  _id?: string;
  senderId: string;
  senderRole: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  senderName: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface InquiryParticipant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface InquiryWarehouseSummary {
  _id: string;
  title: string;
  address?: {
    city?: string;
    state?: string;
    street?: string;
  };
  images?: string[];
  capacityUnit?: string;
  pricePerUnitPerDay?: number;
  minBookingDays?: number;
}

export interface Inquiry {
  _id: string;
  warehouseId?: InquiryWarehouseSummary | any;
  customerId?: InquiryParticipant | any;
  managerId?: InquiryParticipant | any;
  messages: InquiryMessage[];
  lastMessage: string;
  lastMessageAt: string;
  status: 'OPEN' | 'RESOLVED';
  unreadCustomerCount: number;
  unreadManagerCount: number;
  createdAt: string;
  updatedAt: string;
}

