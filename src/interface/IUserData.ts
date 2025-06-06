export interface UserSignUpData {
  name?: string;
  username?: string;
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
  _id:string;
  email: string;
  name: string;
  isVerified?: boolean;
  qualification?: string;
  phone?: number;
  profile?: {
    dob?: Date|string;
    firstName?: string;
    gender?: "Male" | "Female" | "Other" | string;
    lastName?: string;
    address?:string;
    profilePic?: string;
  };
  cv: string;
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
   
  };
  instructorDetails?: {
    createdCourses?: string;
    profit?: number;
    rating?: number;
  };
  aboutMe: string;
  isRequested: string; 
  isApproved:boolean
  socialMedia?: {
    linkedin?: string;
    github?: string;
  }
  experience:string;
  subscriptionStatus?: "active" | "inactive"
  stripeCustomerId?: string;
}


export interface IUserdataResponse {
  success: boolean;
  message: string;
  data: IUserdata;
}
   

export interface IAdminData {
  _id?: string;
  email: string;
  role: "Admin";
  name?: string;

}



