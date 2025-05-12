import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Pricing {
  type: "free" | "paid";
  amount: number;
}

interface CourseFormState {
  title: string;
  description: string;
  categoryRef: string;
  language: string;
  level: string;
  pricing: Pricing;
  thumbnail: File | null;
  thumbnailPreview: string | null;
  isSubmitted?: boolean;
}

interface CourseFormContextType {
  formData: CourseFormState;
  updateFormData: (data: Partial<CourseFormState>) => void;
  resetFormData: () => void;
}

const initialState: CourseFormState = {
  title: "",
  description: "",
  categoryRef: "",
  language: "",
  level: "",
  pricing: { type: "free", amount: 0 },
  thumbnail: null,
  thumbnailPreview: null,
  isSubmitted: false,
};

const CourseFormContext = createContext<CourseFormContextType | undefined>(undefined);

export const useCourseForm = () => {
  const context = useContext(CourseFormContext);
  if (!context) {
    throw new Error("useCourseForm must be used within a CourseFormProvider");
  }
  return context;
};

export const CourseFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<CourseFormState>(() => {
    const savedData = localStorage.getItem("courseFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        ...initialState,
        ...parsedData,
        thumbnail: null, 
      };
    }
    return initialState;
  });

  useEffect(() => {
    const dataToPersist = {
      ...formData,
      thumbnail: null, 
    };
    localStorage.setItem("courseFormData", JSON.stringify(dataToPersist));
  }, [formData]);

  const updateFormData = (data: Partial<CourseFormState>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(initialState);
    localStorage.removeItem("courseFormData");
  };

  return (
    <CourseFormContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </CourseFormContext.Provider>
  );
};