export interface SendOtpRequest {
  mobileNumber: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds until OTP expires
}

export interface VerifyOtpRequest {
  mobileNumber: string;
  otp: string;
}

export interface User {
  id: string;
  name: string;
  mobileNumber: string;
  createdAt?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  needsProfile?: boolean; // true if user needs to complete profile
  user?: User;
  token?: string;
  tempToken?: string; // temporary token for profile completion
}

export interface CompleteProfileRequest {
  name: string;
  tempToken: string;
}

export interface CompleteProfileResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface OtpData {
  otp: string;
  expiresAt: number;
  attempts: number;
}

export interface JWTPayload {
  userId: string;
  mobileNumber: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface TempJWTPayload {
  mobileNumber: string;
  temp: boolean;
  iat?: number;
  exp?: number;
}
