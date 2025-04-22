export interface IOption {
  id: string;
  text: string;
}

export interface IQuestion {
  id: string;
  text: string;
  options: IOption[];
  correctOption: string;
  marks:number
}

export interface IAssessment {
  _id: string;
  courseId: string;
  moduleTitle: string;
  title: string;
  description: string;
  questions: {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correctOption: string;
    marks: number;
  }[];
  totalMarks: number;
  createdAt: string;
  updatedAt: string;
}