import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createCourseAction } from "../../../redux/actions/courseActions";
import { fetchUserData } from "../../../redux/actions/auth/fetchUserdataAction";
import Sidebar from "../InstructorSidebar";
import { AppDispatch, RootState } from "../../../redux/store";
import { useCourseForm } from "../../context/CourseFormContext";
import { toast } from "react-toastify";
import InstructorNavbar from "../InstructorNavbar";

const AddIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);

const RemoveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const LessonSchema = Yup.object().shape({
  modules: Yup.array()
    .of(
      Yup.object().shape({
        moduleTitle: Yup.string()
          .min(5, "Module title must be at least 5 characters")
          .max(100, "Module title must be less than 100 characters")
          .required("Module title is required"),
        lessons: Yup.array()
          .of(
            Yup.object().shape({
              title: Yup.string()
                .min(5, "Lesson title must be at least 5 characters")
                .max(100, "Lesson title must be less than 100 characters")
                .required("Lesson title is required"),
              description: Yup.string()
                .min(20, "Description must be at least 20 characters")
                .max(500, "Description must be less than 500 characters")
                .required("Description is required"),
              objectives: Yup.array()
                .of(Yup.string())
                .min(1, "At least one objective is required")
                .required("Objectives are required"),
              video: Yup.mixed()
                .required("Video file is required")
                .test(
                  "fileType",
                  "Only video files are allowed (e.g., MP4, WebM, Ogg)",
                  (value) => {
                    if (!value) return false;
                    const validVideoTypes = [
                      "video/mp4",
                      "video/webm",
                      "video/ogg",
                    ];
                    return (
                      value instanceof File &&
                      validVideoTypes.includes(value.type)
                    );
                  }
                ),
              duration: Yup.string().required("Duration is required"),
            })
          )
          .min(1, "At least one lesson is required per module"),
      })
    )
    .min(1, "At least one module is required"),
});

const TagInput = ({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
}) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      setTags([...tags, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-gray-300 rounded p-2 bg-white">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="bg-teal-500 text-white px-3 py-1 rounded-full flex items-center text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-2 focus:outline-none"
            >
              <RemoveIcon />
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type objective and press Enter"
        className="w-full p-1 focus:outline-none focus:ring-0"
      />
    </div>
  );
};

interface VideoFileInputProps {
  onChange: (file: { file: File | null; duration: number } | null) => void;
  initialValue?: { file: File | null; duration: number };
}

const VideoFileInput: React.FC<VideoFileInputProps> = ({
  onChange,
  initialValue = { file: null, duration: 0 },
}) => {
  const [preview, setPreview] = useState<string | null>(
    initialValue.file ? URL.createObjectURL(initialValue.file) : null
  );
  const [duration, setDuration] = useState<number>(initialValue.duration);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
      if (!validVideoTypes.includes(file.type)) {
        setError("Only video files are allowed (e.g., MP4, WebM, Ogg)");
        setPreview(null);
        setDuration(0);
        onChange(null);
        return;
      }

      setError(null);
      const fileUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = fileUrl;
      video.onloadedmetadata = () => {
        const videoDuration = Math.floor(video.duration);
        setPreview(fileUrl);
        setDuration(videoDuration);
        onChange({ file, duration: videoDuration });
      };
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        {preview ? (
          <div className="space-y-3">
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <video className="max-h-full rounded-lg" controls src={preview}>
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Duration: {formatDuration(duration)}</span>
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setDuration(0);
                  setError(null);
                  onChange(null);
                }}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h18M3 16h18"
              />
            </svg>
            <div className="flex text-sm justify-center">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-teal-500 hover:text-teal-600">
                <span>Upload a video</span>
                <input
                  type="file"
                  className="sr-only"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1 text-gray-600">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">MP4, WebM, Ogg up to 100MB</p>
          </div>
        )}
      </div>
      {error && <div className="text-red-600 text-xs">{error}</div>}
    </div>
  );
};

type Lesson = {
  lessonNumber: number;
  title: string;
  description: string;
  objectives: string[];
  video: File | null;
  duration: string;
  uploaded?: boolean;
  isOpen?: boolean;
  isEditing?: boolean;
};

type Module = {
  moduleTitle: string;
  lessons: Lesson[];
  isOpen?: boolean;
};

const AddLessonsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("courses");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { resetFormData } = useCourseForm();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseDataFromState = location.state?.courseData;
  const [courseData, setCourseData] = useState<any>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await dispatch(fetchUserData()).unwrap();
      } catch (err: any) {
        setError(err.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (courseDataFromState) {
      const {
        thumbnail,
        thumbnailPreview: previewFromState,
        ...dataToPersist
      } = courseDataFromState;
      localStorage.setItem(
        "addLessonsCourseData",
        JSON.stringify({
          ...dataToPersist,
          thumbnailPreview: previewFromState || null,
        })
      );
      setCourseData(dataToPersist);
      setThumbnailFile(courseDataFromState.thumbnail || null);
      setThumbnailPreview(courseDataFromState.thumbnailPreview || null);
    } else {
      const savedData = localStorage.getItem("addLessonsCourseData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setCourseData(parsedData);
        setThumbnailPreview(parsedData.thumbnailPreview || null);
      }
    }
    setIsDataLoaded(true);
  }, [courseDataFromState, dispatch, isAuthenticated]);

  useEffect(() => {
    if (isDataLoaded && !courseData) {
      navigate("/instructor/courses/create");
    }
  }, [isDataLoaded, courseData, navigate]);

  if (!isDataLoaded || !courseData) {
    return null;
  }

  const initialModules: Module[] = [
    {
      moduleTitle: "",
      lessons: [
        {
          lessonNumber: 1,
          title: "",
          description: "",
          objectives: [],
          video: null,
          duration: "",
          isOpen: true,
          isEditing: true,
        },
      ],
      isOpen: true,
    },
  ];

  const initialValues = {
    modules: initialModules,
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        open={sidebarOpen}
        currentPage={currentPage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        setCurrentPage={setCurrentPage}
      />

      <div
        className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Add Lessons
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to go back? Your lesson data will be lost."
                      )
                    ) {
                      navigate("/instructor/courses/create", {
                        state: {
                          courseData: {
                            ...courseData,
                            thumbnail: thumbnailFile,
                            thumbnailPreview,
                          },
                        },
                      });
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Back to Courses
                </button>
                <InstructorNavbar loading={loading} error={error} />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Formik
            initialValues={initialValues}
            validationSchema={LessonSchema}
            validateOnMount
            validateOnChange
            validateOnBlur
            onSubmit={async (values, { setSubmitting }) => {
              try {
                if (!thumbnailFile) {
                  throw new Error(
                    "Please upload the course thumbnail to proceed."
                  );
                }

                const combinedData = {
                  ...courseData,
                  modules: values.modules.map((module) => ({
                    moduleTitle: module.moduleTitle,
                    lessons: module.lessons
                      .filter((lesson) => lesson.uploaded)
                      .map((lesson) => ({
                        lessonNumber: lesson.lessonNumber,
                        title: lesson.title,
                        description: lesson.description,
                        objectives: lesson.objectives,
                        duration: lesson.duration,
                      })),
                  })),
                };

                const formData = new FormData();
                formData.append("courseData", JSON.stringify(combinedData));
                formData.append("thumbnail", thumbnailFile);

                values.modules.forEach((module) => {
                  module.lessons
                    .filter((lesson) => lesson.uploaded)
                    .forEach((lesson) => {
                      if (lesson.video) {
                        if (!(lesson.video instanceof File)) {
                          throw new Error("Lesson video must be a File object");
                        }
                        formData.append("videos", lesson.video);
                      }
                    });
                });

                await dispatch(createCourseAction(formData)).unwrap();
                resetFormData();
                localStorage.removeItem("addLessonsCourseData");

                toast.success("Course created successfully!", {
                  position: "top-right",
                  autoClose: 3000,
                });

                navigate("/instructor/courses", {
                  state: { message: "Course created successfully!" },
                });
              } catch (error: any) {
                const errorMessage =
                  error.message ||
                  "An error occurred while creating the course.";

                // Check for the specific error and redirect to AddCoursePage
                if (
                  errorMessage.includes(
                    "course with this title and level exists already"
                  )
                ) {
                  toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                  });

                  navigate("/instructor/courses", {
                    state: {
                      courseData: {
                        ...courseData,
                        thumbnail: thumbnailFile,
                        thumbnailPreview,
                      },
                      error: errorMessage,
                    },
                  });
                } else {
                  toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                  });
                }
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue, errors, touched, isSubmitting }) => (
              <Form>
                <FieldArray name="modules">
                  {({ push: pushModule, remove: removeModule }) => (
                    <div className="space-y-6">
                      {values.modules.map((module, moduleIndex) => {
                        const moduleErrors =
                          (errors.modules?.[moduleIndex] as any) || {};
                        const moduleTouched =
                          touched.modules?.[moduleIndex] || {};
                        const isEditingLesson = module.lessons.some(
                          (lesson) => lesson.isEditing
                        );

                        return (
                          <div
                            key={moduleIndex}
                            className="bg-gray-50 shadow-md rounded-lg overflow-hidden"
                          >
                            <div className="border-b border-gray-200 bg-gray-100">
                              <button
                                type="button"
                                className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                                onClick={() => {
                                  const newModules = [...values.modules];
                                  newModules[moduleIndex] = {
                                    ...newModules[moduleIndex],
                                    isOpen: !newModules[moduleIndex].isOpen,
                                  };
                                  setFieldValue("modules", newModules);
                                }}
                              >
                                <div className="flex items-center">
                                  <h2 className="text-xl font-semibold text-gray-900">
                                    Module {moduleIndex + 1}
                                  </h2>
                                  {module.moduleTitle && (
                                    <span className="ml-3 text-gray-500">
                                      - {module.moduleTitle}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <svg
                                    className={`h-5 w-5 text-gray-500 transform transition-transform ${
                                      module.isOpen ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </div>
                              </button>
                            </div>

                            {module.isOpen && (
                              <div className="p-6">
                                <div className="mb-6">
                                  <label
                                    htmlFor={`modules[${moduleIndex}].moduleTitle`}
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Module Title
                                  </label>
                                  <Field
                                    name={`modules[${moduleIndex}].moduleTitle`}
                                    type="text"
                                    placeholder="Enter module title"
                                    className={`mt-1 block w-full rounded-md shadow-sm py-3 px-4 border ${
                                      moduleErrors.moduleTitle &&
                                      moduleTouched.moduleTitle
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                                    }`}
                                  />
                                  <ErrorMessage
                                    name={`modules[${moduleIndex}].moduleTitle`}
                                    component="div"
                                    className="mt-1 text-sm text-red-600"
                                  />
                                </div>

                                <FieldArray
                                  name={`modules[${moduleIndex}].lessons`}
                                >
                                  {({
                                    push: pushLesson,
                                    remove: removeLesson,
                                  }) => (
                                    <div className="space-y-6">
                                      {module.lessons.map(
                                        (lesson, lessonIndex) => {
                                          const lessonErrors =
                                            (moduleErrors.lessons?.[
                                              lessonIndex
                                            ] as any) || {};
                                          const lessonTouched =
                                            moduleTouched.lessons?.[
                                              lessonIndex
                                            ] || {};
                                          const isLessonValid =
                                            Object.keys(lessonErrors).length ===
                                              0 &&
                                            lesson.title &&
                                            lesson.description &&
                                            lesson.objectives.length > 0 &&
                                            lesson.video &&
                                            lesson.duration;

                                          return (
                                            <div
                                              key={lessonIndex}
                                              className="bg-white shadow-md rounded-lg overflow-hidden"
                                            >
                                              <div className="border-b border-gray-200">
                                                <button
                                                  type="button"
                                                  className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                                                  onClick={() => {
                                                    const newModules = [
                                                      ...values.modules,
                                                    ];
                                                    newModules[
                                                      moduleIndex
                                                    ].lessons[lessonIndex] = {
                                                      ...newModules[moduleIndex]
                                                        .lessons[lessonIndex],
                                                      isOpen:
                                                        !newModules[moduleIndex]
                                                          .lessons[lessonIndex]
                                                          .isOpen,
                                                    };
                                                    setFieldValue(
                                                      "modules",
                                                      newModules
                                                    );
                                                  }}
                                                >
                                                  <div className="flex items-center">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                      Lesson{" "}
                                                      {lesson.lessonNumber}
                                                    </h3>
                                                    {lesson.title && (
                                                      <span className="ml-3 text-gray-500">
                                                        - {lesson.title}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center">
                                                    {lesson.uploaded && (
                                                      <span className="mr-3 text-green-500 flex items-center">
                                                        <CheckIcon />
                                                      </span>
                                                    )}
                                                    <svg
                                                      className={`h-5 w-5 text-gray-500 transform transition-transform ${
                                                        lesson.isOpen
                                                          ? "rotate-180"
                                                          : ""
                                                      }`}
                                                      fill="none"
                                                      viewBox="0 0 24 24"
                                                      stroke="currentColor"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                      />
                                                    </svg>
                                                  </div>
                                                </button>
                                              </div>

                                              {(lesson.isOpen ||
                                                lessonIndex === 0) && (
                                                <div className="p-6">
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                      <VideoFileInput
                                                        onChange={(file) => {
                                                          if (file) {
                                                            setFieldValue(
                                                              `modules[${moduleIndex}].lessons[${lessonIndex}].video`,
                                                              file.file
                                                            );
                                                            setFieldValue(
                                                              `modules[${moduleIndex}].lessons[${lessonIndex}].duration`,
                                                              file.duration.toString()
                                                            );
                                                          } else {
                                                            setFieldValue(
                                                              `modules[${moduleIndex}].lessons[${lessonIndex}].video`,
                                                              null
                                                            );
                                                            setFieldValue(
                                                              `modules[${moduleIndex}].lessons[${lessonIndex}].duration`,
                                                              ""
                                                            );
                                                          }
                                                        }}
                                                        initialValue={{
                                                          file: lesson.video,
                                                          duration: parseInt(
                                                            lesson.duration ||
                                                              "0",
                                                            10
                                                          ),
                                                        }}
                                                      />
                                                      <ErrorMessage
                                                        name={`modules[${moduleIndex}].lessons[${lessonIndex}].video`}
                                                        component="div"
                                                        className="text-red-600 text-xs"
                                                      />
                                                      <ErrorMessage
                                                        name={`modules[${moduleIndex}].lessons[${lessonIndex}].duration`}
                                                        component="div"
                                                        className="text-red-600 text-xs"
                                                      />
                                                    </div>
                                                    <div className="space-y-4">
                                                      <div>
                                                        <label
                                                          htmlFor={`modules[${moduleIndex}].lessons[${lessonIndex}].title`}
                                                          className="block text-sm font-medium text-gray-700"
                                                        >
                                                          Title
                                                        </label>
                                                        <Field
                                                          name={`modules[${moduleIndex}].lessons[${lessonIndex}].title`}
                                                          type="text"
                                                          placeholder="Lesson Title"
                                                          className={`mt-1 block w-full rounded-md shadow-sm py-3 px-4 border ${
                                                            lessonErrors.title &&
                                                            lessonTouched.title
                                                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                              : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                                                          }`}
                                                        />
                                                        <ErrorMessage
                                                          name={`modules[${moduleIndex}].lessons[${lessonIndex}].title`}
                                                          component="div"
                                                          className="mt-1 text-sm text-red-600"
                                                        />
                                                      </div>
                                                      <div>
                                                        <label
                                                          htmlFor={`modules[${moduleIndex}].lessons[${lessonIndex}].description`}
                                                          className="block text-sm font-medium text-gray-700"
                                                        >
                                                          Description
                                                        </label>
                                                        <Field
                                                          as="textarea"
                                                          name={`modules[${moduleIndex}].lessons[${lessonIndex}].description`}
                                                          rows={3}
                                                          placeholder="Lesson Description"
                                                          className={`mt-1 block w-full rounded-md shadow-sm py-3 px-4 border ${
                                                            lessonErrors.description &&
                                                            lessonTouched.description
                                                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                              : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                                                          }`}
                                                        />
                                                        <ErrorMessage
                                                          name={`modules[${moduleIndex}].lessons[${lessonIndex}].description`}
                                                          component="div"
                                                          className="mt-1 text-sm text-red-600"
                                                        />
                                                      </div>
                                                      <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                          Learning Objectives
                                                        </label>
                                                        <TagInput
                                                          tags={
                                                            lesson.objectives ||
                                                            []
                                                          }
                                                          setTags={(tags) =>
                                                            setFieldValue(
                                                              `modules[${moduleIndex}].lessons[${lessonIndex}].objectives`,
                                                              tags
                                                            )
                                                          }
                                                        />
                                                        <ErrorMessage
                                                          name={`modules[${moduleIndex}].lessons[${lessonIndex}].objectives`}
                                                          component="div"
                                                          className="mt-1 text-sm text-red-600"
                                                        />
                                                      </div>
                                                      <button
                                                        type="button"
                                                        disabled={
                                                          !isLessonValid
                                                        }
                                                        onClick={() => {
                                                          setFieldValue(
                                                            `modules[${moduleIndex}].lessons[${lessonIndex}].uploaded`,
                                                            true
                                                          );
                                                          setFieldValue(
                                                            `modules[${moduleIndex}].lessons[${lessonIndex}].isEditing`,
                                                            false
                                                          );
                                                          toast.success(
                                                            `Lesson ${lesson.lessonNumber} saved successfully!`,
                                                            {
                                                              position:
                                                                "top-right",
                                                              autoClose: 3000,
                                                            }
                                                          );
                                                        }}
                                                        className={`mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                                          isLessonValid
                                                            ? "bg-teal-500 hover:bg-teal-600"
                                                            : "bg-gray-300 cursor-not-allowed"
                                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                                                      >
                                                        <CheckIcon />
                                                        <span className="ml-2">
                                                          Save Lesson
                                                        </span>
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }
                                      )}
                                      <div className="flex justify-between pt-4">
                                        <div className="flex space-x-3">
                                          <button
                                            type="button"
                                            disabled={isEditingLesson}
                                            onClick={() => {
                                              pushLesson({
                                                lessonNumber:
                                                  module.lessons.length + 1,
                                                title: "",
                                                description: "",
                                                objectives: [],
                                                video: null,
                                                duration: "",
                                                isOpen: true,
                                                isEditing: true,
                                              });
                                            }}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                              isEditingLesson
                                                ? "bg-gray-300 cursor-not-allowed"
                                                : "bg-teal-500 hover:bg-teal-600"
                                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                                          >
                                            <AddIcon />
                                            <span className="ml-2">
                                              Add Lesson
                                            </span>
                                          </button>
                                          {module.lessons.length > 1 && (
                                            <button
                                              type="button"
                                              disabled={isEditingLesson}
                                              onClick={() => {
                                                const lastLesson =
                                                  module.lessons[
                                                    module.lessons.length - 1
                                                  ];
                                                if (!lastLesson.isEditing) {
                                                  removeLesson(
                                                    module.lessons.length - 1
                                                  );
                                                }
                                              }}
                                              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white ${
                                                isEditingLesson
                                                  ? "bg-gray-200 cursor-not-allowed"
                                                  : "hover:bg-gray-50"
                                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
                                            >
                                              <RemoveIcon />
                                              <span className="ml-2">
                                                Remove Last Lesson
                                              </span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </FieldArray>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div className="flex justify-between pt-4">
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() =>
                              pushModule({
                                moduleTitle: "",
                                lessons: [
                                  {
                                    lessonNumber: 1,
                                    title: "",
                                    description: "",
                                    objectives: [],
                                    video: null,
                                    duration: "",
                                    isOpen: true,
                                    isEditing: true,
                                  },
                                ],
                                isOpen: true,
                              })
                            }
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                          >
                            <AddIcon />
                            <span className="ml-2">Add Module</span>
                          </button>
                          {values.modules.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeModule(values.modules.length - 1)
                              }
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              <RemoveIcon />
                              <span className="ml-2">Remove Last Module</span>
                            </button>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isSubmitting
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-teal-500 hover:bg-teal-600"
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                        >
                          {isSubmitting ? "Creating..." : "Create Course"}
                        </button>
                      </div>
                    </div>
                  )}
                </FieldArray>
              </Form>
            )}
          </Formik>
        </main>
      </div>
    </div>
  );
};

export default AddLessonsPage;
