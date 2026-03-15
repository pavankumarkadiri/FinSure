export type UserRole = 'CUSTOMER' | 'OFFICER';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SessionState {
  token: string;
  email: string;
  role: UserRole;
  userId: number | null;
}
