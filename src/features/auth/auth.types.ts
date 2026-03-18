export type AuthRole = 'BUYER' | 'SUPPLIER';

export interface LoginRequest {
  email: string;
  password: string;
  role: AuthRole;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  wilayaCode: string;
  role: AuthRole;
  companyName?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  userId?: number;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyName: string;
    role: string;
    enabled: boolean;
    wilaya?: string;
  };
}

export type AuthTab = 'login' | 'register';
