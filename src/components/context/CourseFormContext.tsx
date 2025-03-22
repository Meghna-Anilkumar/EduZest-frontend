import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the shape of the form data
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
  isSubmitted?: boolean; // Add a flag to track submission status
}

interface CourseFormContextType {
  formData: CourseFormState;
  updateFormData: (data: Partial<CourseFormState>) => void;
  resetFormData: () => void;
}

// Initial state for the form
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

// Create the context
const CourseFormContext = createContext<CourseFormContextType | undefined>(undefined);

// Custom hook to use the context
export const useCourseForm = () => {
  const context = useContext(CourseFormContext);
  if (!context) {
    throw new Error("useCourseForm must be used within a CourseFormProvider");
  }
  return context;
};

// Provider component
export const CourseFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<CourseFormState>(() => {
    // Load persisted data from localStorage on initial render
    const savedData = localStorage.getItem("courseFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        ...initialState,
        ...parsedData,
        thumbnail: null, // File objects can't be persisted, so reset to null
      };
    }
    return initialState;
  });

  // Persist form data to localStorage whenever it changes
  useEffect(() => {
    const dataToPersist = {
      ...formData,
      thumbnail: null, // Exclude the File object from persistence
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