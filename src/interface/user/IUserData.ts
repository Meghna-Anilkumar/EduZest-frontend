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
  isVerified?: boolean;
  qualification?: string;
  phone?: number;
  profile?: {
    dob?: Date;
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
  socialMedia?: {
    linkedin?: string;
    github?: string;
  }
  experience:string;
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



