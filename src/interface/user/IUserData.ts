export interface UserSignUpData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type SignUpCredentials = Omit<UserSignUpData, "confirmPassword">;


export interface OtpVerificationData {
  otp: number;
  email:string;
}