export type UserRole = 'CUSTOMER' | 'MANAGER' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  dob?: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}
