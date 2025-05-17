import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface Lesson {
  _id?: string;
  lessonNumber: string;
  title: string;
  description: string;
  objectives?: string[];
  video: string;
  videoKey?: string;
  duration?: string;
  content?: string;
  resources?: string[];
}

interface LessonFormProps {
  lesson: Lesson;
  onSave: (updatedLesson: Lesson, videoFile?: File) => void;
  onCancel: () => void;
  isEditing: boolean;
  courseId: string;
}





const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const durationInSeconds = video.duration;
      resolve(durationInSeconds);
    };
    video.onerror = () => reject(new Error("Error loading video metadata"));
    video.src = window.URL.createObjectURL(file);
  });
};

const lessonValidationSchema = Yup.object({
  title: Yup.string()
    .required("Lesson title is required")
    .min(3, "Title must be at least 3 characters long"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters long"),
  videoFile: Yup.mixed<File>()
    .required("A video file is required")
    .test(
      "fileType",
      "Only video files are allowed (e.g., .mp4, .mov)",
      (value) => {
        if (!value) return false;
        const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/mpeg"];
        return allowedTypes.includes((value as File).type);
      }
    ),
});

const editLessonValidationSchema = Yup.object({
  title: Yup.string()
    .required("Lesson title is required")
    .min(3, "Title must be at least 3 characters long"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters long"),
  videoFile: Yup.mixed<File>()
    .optional()
    .test(
      "fileType",
      "Only video files are allowed (e.g., .mp4, .mov)",
      (value) => {
        if (!value) return true;
        const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/mpeg"];
        return allowedTypes.includes((value as File).type);
      }
    ),
});

const LessonForm: React.FC<LessonFormProps> = ({
  lesson,
  onSave,
  onCancel,
  isEditing,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    values: any;
    setSubmitting: (isSubmitting: boolean) => void;
    resetForm: () => void;
  } | null>(null);

  const handleSubmitClick = (
    values: any,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    setPendingSubmission({ values, setSubmitting, resetForm });
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingSubmission) return;
    
    const { values, setSubmitting, resetForm } = pendingSubmission;
    
    const updatedLesson: Lesson = {
      ...lesson,
      title: values.title,
      description: values.description,
      duration: values.duration || lesson.duration,
      video: lesson.videoKey || "",
      videoKey: lesson.videoKey || "",
    };
    
    await onSave(updatedLesson, values.videoFile);
    if (!isEditing) resetForm();
    setSubmitting(false);
    setIsModalOpen(false);
    setPendingSubmission(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (pendingSubmission) {
      pendingSubmission.setSubmitting(false);
    }
    setPendingSubmission(null);
  };

  return (
    <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {isEditing ? "Edit Lesson" : "Add New Lesson"}
      </h3>
      <Formik
        initialValues={{
          title: lesson.title || "",
          description: lesson.description || "",
          duration: lesson.duration || "",
          videoFile: undefined as File | undefined,
        }}
        validationSchema={isEditing ? editLessonValidationSchema : lessonValidationSchema}
        onSubmit={handleSubmitClick}
      >
        {({ setFieldValue, isSubmitting, values }) => (
          <Form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Lesson Title <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="title"
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#49BBBD]"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <Field
                as="textarea"
                name="description"
                className="w-full border rounded-md px-4 py-2 h-32 focus:ring-2 focus:ring-[#49BBBD]"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Upload Video {isEditing ? "" : <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  setFieldValue("videoFile", file);
                  if (file) {
                    try {
                      const durationInHours = await getVideoDuration(file);
                      setFieldValue("duration", durationInHours.toFixed(2));
                    } catch (error) {
                      console.error("Error getting video duration:", error);
                      setFieldValue("duration", lesson.duration || "");
                    }
                  } else {
                    setFieldValue("duration", lesson.duration || "");
                  }
                }}
                className="w-full border rounded-md px-4 py-2"
              />
              <ErrorMessage 
                name="videoFile"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            {values.duration && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Duration (hours)
                </label>
                <Field
                  type="text"
                  name="duration"
                  className="w-full border rounded-md px-4 py-2 bg-gray-100"
                  readOnly
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Lesson"}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
        message={isEditing 
          ? "Are you sure you want to save these changes to the lesson?" 
          : "Are you sure you want to add this new lesson?"}
      />
    </div>
  );
};

export default LessonForm;