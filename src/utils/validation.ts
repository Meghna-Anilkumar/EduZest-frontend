// Validation utility functions
export const required = (value: string) =>
  value.trim() ? null : "This field is required";

export const email = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Invalid email format";

export const minLength = (length: number) => (value: string) =>
  value.length >= length ? null : `Must be at least ${length} characters long`;

export const match = (field: string, compareValue: string) => (value: string) =>
  value === compareValue ? null : `${field} does not match`;


export const otp = (value: string) =>
  /^[0-9]{6}$/.test(value) ? null : "OTP must be a 6-digit number";


export const validationRules: Record<
  string,
  (value: string, values?: { [key: string]: any }) => string | null
> = {
  name: (value: string) => required(value),

  email: (value: string) => required(value) || email(value),

  password :(value: string): string | null => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return "Password must contain at least one special character";
    }
    return null; 
  },
  
  
  // confirmPassword: (value: string, values?: { [key: string]: any }) =>
  //   required(value) || match("Password", values?.password || "")(value),

  confirmPassword: (value: string, values?: { [key: string]: any }) => {
    if (!value) return "Confirm Password is required";
    if (value !== values?.newPassword) return "Passwords do not match";
    return null;
  },
  

  otp: (value: string) => required(value) || otp(value),
};
