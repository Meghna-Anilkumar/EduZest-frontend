export interface ILesson {
  lessonNumber: string;
  title: string;
  description: string;
  video: string;
  videoKey?: string;
  duration?: string;
  objectives?: string[];
}

export interface IModule {
  moduleTitle: string;
  lessons: ILesson[];
}

export interface ITrial {
  video?: string;
}

export interface IPricing {
  type: "free" | "paid";
  amount: number;
}

export interface IAttachment {
  title?: string;
  url?: string;
}

export interface IInstructorRef {
  name: string;
  email?: string;
  profile: { profilePic: string };
}

export interface ICategoryRef {
  categoryName: string;
}

export interface IOfferDetails {
  discountPercentage: number;
  offerPrice: number;
}

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorRef: IInstructorRef;
  categoryRef: ICategoryRef;
  language: string;
  level: "beginner" | "intermediate" | "advanced";
  modules: IModule[];
  trial: ITrial;
  pricing: IPricing;
  attachments?: IAttachment;
  isRequested: boolean;
  isBlocked: boolean;
  studentsEnrolled: number;
  isPublished: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  offer?: IOfferDetails; 
}

export interface FilterOptions {
  level?: "beginner" | "intermediate" | "advanced";
  pricingType?: "free" | "paid";
}

export interface SortOptions {
  field: "price" | "updatedAt" | "studentsEnrolled";
  order: "asc" | "desc";
}