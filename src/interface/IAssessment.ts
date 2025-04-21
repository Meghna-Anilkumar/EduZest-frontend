export interface IOption {
  id: string;
  text: string;
}

export interface IQuestion {
  id: string;
  text: string;
  options: IOption[];
  correctOption: string;
}

export interface IAssessment {
  id: string;
  courseId: string;
  moduleTitle: string;
  title: string;
  description: string;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}
