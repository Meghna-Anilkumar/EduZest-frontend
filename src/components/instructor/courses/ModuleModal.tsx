import React, { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader } from "../../Loader";
import { useDispatch } from "react-redux";
import { streamVideoAction } from "../../../redux/actions/courseActions";
import { AppDispatch } from "../../../redux/store";

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

interface Module {
  _id?: string;
  moduleTitle: string;
  lessons: Lesson[];
}

interface ModuleViewModalProps {
  module: Module;
  onClose: () => void;
  onSaveLesson?: (updatedLesson: Lesson, videoFile?: File) => void;
  onSaveModule?: (
    updatedModule: Module,
    originalModuleTitle?: string,
    videoFile?: File,
    lessonIndex?: number
  ) => void;
  onRemoveModule?: (moduleTitle: string) => void;
  isAddingNewModule?: boolean;
  courseId: string;
}

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const durationInSeconds = video.duration;
      const durationInHours = durationInSeconds / 3600;
      resolve(durationInHours);
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
        const allowedTypes = [
          "video/mp4",
          "video/mov",
          "video/avi",
          "video/mpeg",
        ];
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
        const allowedTypes = [
          "video/mp4",
          "video/mov",
          "video/avi",
          "video/mpeg",
        ];
        return allowedTypes.includes((value as File).type);
      }
    ),
});

const moduleValidationSchema = Yup.object({
  moduleTitle: Yup.string()
    .required("Module title is required")
    .min(3, "Module title must be at least 3 characters long"),
});

const ModuleViewModal: React.FC<ModuleViewModalProps> = ({
  module,
  onClose,
  onSaveLesson,
  onSaveModule,
  onRemoveModule,
  isAddingNewModule = false,
  courseId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(isAddingNewModule);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  console.log("ModuleViewModal props:", { courseId, module });

  useEffect(() => {
    if (isAddingNewModule) setIsAddingModule(true);
  }, [isAddingNewModule]);

  useEffect(() => {
    console.log("Video streaming useEffect:", {
      selectedLesson,
      courseId,
      videoKey: selectedLesson?.videoKey,
      videoUrl,
    });

    if (videoUrl) {
      console.log("Clearing previous videoUrl:", videoUrl);
      window.URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setVideoError(null);
    setVideoLoading(true);

    if (selectedLesson?.videoKey && courseId) {
      console.log("Dispatching streamVideoAction:", {
        courseId,
        videoKey: selectedLesson.videoKey,
      });
      dispatch(
        streamVideoAction({ courseId, videoKey: selectedLesson.videoKey })
      )
        .unwrap()
        .then((result: { videoUrl: string; videoKey: string }) => {
          console.log("Video stream successful:", result);
          setVideoUrl(result.videoUrl);
          setVideoLoading(false);
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === "object" && error && "message" in error
              ? String(error.message)
              : "Failed to load video. Please try again.";
          console.error("Stream video error:", error);
          setVideoError(errorMessage);
          setVideoLoading(false);
        });
    } else {
      console.log("Cannot dispatch streamVideoAction:", {
        hasVideoKey: !!selectedLesson?.videoKey,
        hasCourseId: !!courseId,
      });
      setVideoLoading(false);
    }

    return () => {
      if (videoUrl) {
        window.URL.revokeObjectURL(videoUrl);
      }
    };
  }, [selectedLesson, courseId, dispatch]);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      console.log("Loading video with URL:", videoUrl);
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  }, [videoUrl]);

  const handleLessonSelect = (lesson: Lesson) => {
    console.log("Selected lesson:", lesson);
    setSelectedLesson(lesson);
    setIsEditingLesson(false);
    setIsAddingLesson(false);
    setIsAddingModule(false);
    setVideoError(null);
    setVideoUrl(null);
  };

  const handleEditLesson = () => {
    setIsEditingLesson(true);
    setIsAddingLesson(false);
    setIsAddingModule(false);
  };

  const handleEditModule = () => {
    setIsEditingModule(true);
    setIsAddingModule(false);
  };

  const handleRemoveLesson = (lessonId?: string) => {
    if (onSaveModule && lessonId) {
      const filteredLessons = module.lessons.filter(
        (lesson) => lesson._id !== lessonId
      );
      const updatedLessons = filteredLessons.map((lesson, index) => ({
        ...lesson,
        lessonNumber: (index + 1).toString(),
      }));
      const updatedModule = { ...module, lessons: updatedLessons };
      onSaveModule(updatedModule);
      setSelectedLesson(null);
    }
  };

  const handleRemoveModule = () => {
    if (onRemoveModule) {
      onRemoveModule(module.moduleTitle);
      onClose();
    }
  };

  const handleAddLesson = () => {
    setIsAddingLesson(true);
    setIsEditingLesson(false);
    setIsAddingModule(false);
    setSelectedLesson(null);
  };

  const handleAddModule = () => {
    setIsAddingModule(true);
    setIsEditingModule(false);
    setIsAddingLesson(false);
    setSelectedLesson(null);
  };

  const renderLessonDetails = () => {
    if (!selectedLesson) return null;

    return (
      <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Lesson {selectedLesson.lessonNumber}: {selectedLesson.title}
          </h3>
          <div className="flex items-center space-x-3">
            {!isEditingLesson && (
              <>
                <button
                  onClick={handleEditLesson}
                  className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] transition-colors"
                >
                  Edit Lesson
                </button>
                <button
                  onClick={() => handleRemoveLesson(selectedLesson._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Remove Lesson
                </button>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>

        {isEditingLesson ? (
          <Formik
            initialValues={{
              title: selectedLesson.title,
              description: selectedLesson.description,
              duration: selectedLesson.duration || "",
              videoFile: undefined as File | undefined,
            }}
            validationSchema={editLessonValidationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setIsSubmitting(true);
              if (onSaveLesson) {
                const updatedLesson: Lesson = {
                  ...selectedLesson,
                  title: values.title,
                  description: values.description,
                  duration: values.duration || selectedLesson.duration,
                  video: selectedLesson.videoKey || "",
                };
                await onSaveLesson(updatedLesson, values.videoFile);
                setSelectedLesson(updatedLesson);
                setIsEditingLesson(false);
              }
              setIsSubmitting(false);
              setSubmitting(false);
            }}
          >
            {({ setFieldValue, isSubmitting: formikSubmitting, values }) => (
              <Form className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Lesson Title
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
                    Description
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
                    Upload Video (optional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={async (
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => {
                      const file = e.target.files?.[0];
                      setFieldValue("videoFile", file);
                      if (file) {
                        try {
                          const durationInHours = await getVideoDuration(file);
                          setFieldValue("duration", durationInHours.toFixed(2));
                        } catch (error) {
                          console.error("Error getting video duration:", error);
                          setFieldValue(
                            "duration",
                            selectedLesson.duration || ""
                          );
                        }
                      } else {
                        setFieldValue(
                          "duration",
                          selectedLesson.duration || ""
                        );
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
                    onClick={() => setIsEditingLesson(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={formikSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    disabled={formikSubmitting}
                  >
                    {formikSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="space-y-6">
            {selectedLesson.videoKey ? (
              <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                {videoLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <p className="text-gray-600">Loading video...</p>
                  </div>
                ) : videoError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <p className="text-red-500">Error: {videoError}</p>
                  </div>
                ) : videoUrl ? (
                  <video
                    ref={videoRef}
                    controls
                    className="absolute inset-0 w-full h-full object-cover"
                    key={selectedLesson.videoKey}
                    onError={() =>
                      setVideoError("Failed to play video. Please try again.")
                    }
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <p className="text-gray-600">
                      No video URL available for {selectedLesson.videoKey}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-600">
                  No video provided for this lesson
                </p>
              </div>
            )}
            {videoError && (
              <p className="text-red-500 text-sm mt-2">{videoError}</p>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                Lesson Overview
              </h4>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Duration:{" "}
                  {selectedLesson.duration
                    ? `${selectedLesson.duration} hours`
                    : "N/A"}
                </span>
                <span>Lesson Number: {selectedLesson.lessonNumber}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-700">{selectedLesson.description}</p>
            </div>
            {selectedLesson.resources &&
              selectedLesson.resources.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Additional Resources
                  </h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedLesson.resources.map((resource, index) => (
                      <li key={index}>{resource}</li>
                    ))}
                  </ul>
                </div>
              )}
            {selectedLesson.objectives &&
              selectedLesson.objectives.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Objectives
                  </h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedLesson.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>
    );
  };

  const renderAddLessonForm = () => (
    <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Lesson</h3>
      <Formik
        initialValues={{
          title: "",
          description: "",
          duration: "",
          videoFile: undefined as File | undefined,
        }}
        validationSchema={lessonValidationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setIsSubmitting(true);
          if (onSaveModule) {
            const newLessonData: Lesson = {
              lessonNumber: (module.lessons.length + 1).toString(),
              title: values.title,
              description: values.description,
              duration: values.duration || undefined,
            };
            console.log("Adding new lesson:", {
              newLessonData,
              videoFile: values.videoFile?.name,
              lessonIndex: module.lessons.length,
              moduleTitle: module.moduleTitle,
              courseId,
            });
            const updatedModule = {
              ...module,
              lessons: [...module.lessons, newLessonData],
            };
            console.log("Calling onSaveModule with:", {
              updatedModule,
              videoFile: values.videoFile?.name,
              lessonIndex: module.lessons.length,
            });
            await onSaveModule(
              updatedModule,
              undefined,
              values.videoFile,
              module.lessons.length
            );
            resetForm();
            setIsAddingLesson(false);
          }
          setIsSubmitting(false);
          setSubmitting(false);
        }}
      >
        {({ setFieldValue, isSubmitting: formikSubmitting, values }) => (
          <Form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Lesson Title
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
                Description
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
                Upload Video
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
                      console.log("Selected video file:", {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        duration: durationInHours.toFixed(2),
                      });
                    } catch (error) {
                      console.error("Error getting video duration:", error);
                      setFieldValue("duration", "");
                    }
                  } else {
                    setFieldValue("duration", "");
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
                onClick={() => setIsAddingLesson(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                disabled={formikSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={formikSubmitting}
              >
                {formikSubmitting ? "Adding..." : "Add Lesson"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );

  const renderAddModuleForm = () => (
    <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Module</h3>
      <Formik
        initialValues={{ moduleTitle: "" }}
        validationSchema={moduleValidationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setIsSubmitting(true);
          if (onSaveModule) {
            const newModule: Module = {
              moduleTitle: values.moduleTitle,
              lessons: [],
            };
            await onSaveModule(newModule);
            resetForm();
            setIsAddingModule(false);
          }
          setIsSubmitting(false);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting: formikSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Module Title
              </label>
              <Field
                type="text"
                name="moduleTitle"
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#49BBBD]"
                placeholder="Enter module title"
              />
              <ErrorMessage
                name="moduleTitle"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddingModule(false);
                  onClose();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                disabled={formikSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={formikSubmitting}
              >
                {formikSubmitting ? "Saving..." : "Save Module"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );

  return (
    <>
      {isSubmitting && <Loader />}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl p-8 m-4 overflow-auto">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            {isEditingModule ? (
              <Formik
                initialValues={{ moduleTitle: module.moduleTitle }}
                validationSchema={moduleValidationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setIsSubmitting(true);
                  if (onSaveModule) {
                    const updatedModule = {
                      ...module,
                      moduleTitle: values.moduleTitle,
                    };
                    await onSaveModule(updatedModule, module.moduleTitle);
                    setIsEditingModule(false);
                  }
                  setIsSubmitting(false);
                  setSubmitting(false);
                }}
              >
                {({ isSubmitting: formikSubmitting }) => (
                  <Form className="flex items-center space-x-3 w-full">
                    <div className="flex-1">
                      <Field
                        type="text"
                        name="moduleTitle"
                        className="text-xl font-bold text-gray-800 border rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-[#49BBBD]"
                      />
                      <ErrorMessage
                        name="moduleTitle"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] transition-colors"
                        disabled={formikSubmitting}
                      >
                        Save Module
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingModule(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        disabled={formikSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">
                {isAddingModule ? "New Module" : module.moduleTitle}
              </h2>
            )}
            {!isEditingModule && (
              <div className="flex items-center space-x-3">
                {!isAddingModule && (
                  <>
                    <button
                      onClick={handleEditModule}
                      className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] transition-colors"
                    >
                      Edit Module
                    </button>
                    <button
                      onClick={handleRemoveModule}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Remove Module
                    </button>
                    <button
                      onClick={handleAddLesson}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Add Lesson
                    </button>
                    <button
                      onClick={handleAddModule}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add Module
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 bg-gray-50 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Lessons
              </h3>
              {isAddingModule ? (
                <div className="text-center text-gray-500 py-4">
                  No lessons yet. Save the module to add lessons.
                </div>
              ) : module.lessons.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No lessons available. Add a lesson to get started.
                </div>
              ) : (
                <>
                  {console.log("Rendering lessons:", module.lessons)}
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson._id || lesson.lessonNumber}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`border-b last:border-b-0 py-4 hover:bg-gray-100 transition-colors cursor-pointer rounded-md px-2 ${
                        selectedLesson?._id === lesson._id
                          ? "bg-[#49BBBD] bg-opacity-10"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">
                              Lesson {lesson.lessonNumber}
                            </span>
                            <span className="text-[#49BBBD] bg-[#49BBBD] bg-opacity-10 px-2 py-1 rounded-full text-xs">
                              {lesson.duration
                                ? `${lesson.duration} hrs`
                                : "N/A"}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-800 mt-1">
                            {lesson.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              {isAddingModule ? (
                renderAddModuleForm()
              ) : isAddingLesson ? (
                renderAddLessonForm()
              ) : selectedLesson ? (
                renderLessonDetails()
              ) : (
                <div className="text-center text-gray-500 py-10">
                  Select a lesson to view its details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ModuleViewModal;
