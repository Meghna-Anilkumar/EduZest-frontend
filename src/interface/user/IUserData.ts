export interface UserSignUpData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}


export interface OtpVerificationData {
  otp: number;
  email:string;
}

export interface LoginData{
  email: string;
  password: string;
}


export interface IUserdata {
  email: string;
  name: string;
  isVerified: boolean;
  profile?: {
    dob?: Date;
    firstName?: string;
    gender?: "Male" | "Female" | "Other" | string;
    lastName?: string;
    profilePic?: string;
  };
  updatedAt?: Date;
  role?: "Student" | "Instructor" | "Admin";
  createdAt?: Date;
  isBlocked?: boolean;
  password: string;
  studentDetails?: {
    additionalEmail?: string;
    enrolledCourses?: {
      courseId: string;  
      progress: number;
      rating: string;
    }[];
    phone?: number;
    socialMedia?: string[];
  };
  instructorDetails?: {
    createdCourses?: string;  
    profit?: number;
    rating?: number;
  };
}
