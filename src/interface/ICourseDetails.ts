export interface ILesson {
    _id: string;
    lessonNumber: string;
    title: string;
    description: string;
    videoKey: string;
    duration?: string;
    objectives?: string[];
}

export interface IModule {
    moduleTitle: string;
    lessons: ILesson[];
}

export interface ICourse {
    _id: string;
    title: string;
    description: string;
    instructorRef: {
        _id: string;
        name: string;
        profile?: { profilePic?: string };
    };
    thumbnail: string;
    thumbnailKey?: string;
    modules: IModule[];
    level: "beginner" | "intermediate" | "advanced";
    language: string;
    trial?: { videoKey?: string };
    pricing: { type: "free" | "paid"; amount: number };
    studentsEnrolled: number;
    isPublished: boolean;
}

export interface LessonProgress {
    lessonId: string;
    progress: number;
    isCompleted: boolean;
    lastWatched: string;
}

export interface IAssessment {
    _id: string;
    courseId: string;
    moduleTitle: string;
    title: string;
    description: string;
    questions: {
        _id: string;
        text: string;
        options: string[];
        correctAnswer: number;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface IAssessmentsResponse {
    assessments: IAssessment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}