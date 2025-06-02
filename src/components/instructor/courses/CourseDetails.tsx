import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  getCourseByIdAction,
  editCourseAction,
} from "../../../redux/actions/courseActions";
import Sidebar from "../InstructorSidebar";
import InstructorNavbar from "../InstructorNavbar";
import ModuleViewModal from "./ModuleModal";
import EditCourseModal from "./EditCourseModal";
import { ICourse } from "../../../interface/ICourse";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Lesson {
  _id?: string;
  lessonNumber: string;
  title: string;
  description: string;
  objectives?: string[];
  video: string;
  videoKey?: string;
  duration?: string;
}

interface Module {
  moduleTitle: string;
  lessons: Lesson[];
}

const CourseDetailsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isAddingNewModule, setIsAddingNewModule] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { courseId } = useParams<{ courseId: string }>();

  const {
    data: courses,
    loading,
    error,
  } = useSelector((state: RootState) => state.course);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const courseDetails = courses.find(
    (course: ICourse) => course._id === courseId
  ) as ICourse | undefined;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchCourseData = async () => {
      if (!courseId) return;

      if (!courseDetails) {
        try {
          const response = await dispatch(
            getCourseByIdAction(courseId)
          ).unwrap();
          if (response) {
            dispatch({ type: "course/storeCourseData", payload: response });
          }
        } catch (err) {
          console.error("Error fetching course by ID:", err);
          toast.error("Failed to load course details.");
        }
      }
    };

    fetchCourseData();
  }, [dispatch, courseId, isAuthenticated, navigate, courseDetails]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch({ type: "course/clearError" });
    }
  }, [error, dispatch]);

  const normalizeVideoUrls = (modules: Module[]) => {
    return modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        video: lesson.video ? decodeURIComponent(lesson.video) : lesson.video,
      })),
    }));
  };

  const handleSaveLesson = async (updatedLesson: Lesson, videoFile?: File) => {
    if (!courseDetails || !selectedModule) return;

    setIsUploading(true);
    try {
      const moduleIndex = courseDetails.modules.findIndex(
        (module) => module.moduleTitle === selectedModule.moduleTitle
      );
      const lessonIndex = selectedModule.lessons.findIndex(
        (lesson) => lesson.lessonNumber === updatedLesson.lessonNumber
      );

      const lessonKey = updatedLesson._id
        ? updatedLesson._id
        : `new-lesson-${moduleIndex}-${lessonIndex}`;

      const videoMapping = videoFile ? { [lessonKey]: 0 } : {};

      const updatedModules = courseDetails.modules.map((module, idx) =>
        idx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lIdx) =>
                lIdx === lessonIndex
                  ? {
                      ...updatedLesson,
                      video: videoFile ? "" : lesson.video,
                      videoKey: videoFile ? "" : lesson.videoKey,
                    }
                  : lesson
              ),
            }
          : module
      );

      const normalizedModules = normalizeVideoUrls(updatedModules);
      const formData = new FormData();
      formData.append(
        "courseData",
        JSON.stringify({ ...courseDetails, modules: normalizedModules })
      );
      if (videoFile) {
        formData.append("videos", videoFile);
        formData.append("videoMapping", JSON.stringify(videoMapping));
      }

      console.log("Saving lesson with:", {
        updatedLesson,
        videoMapping,
        videoFile: videoFile?.name,
      });

      await dispatch(
        editCourseAction({ courseId: courseDetails._id, formData })
      ).unwrap();
      toast.success("Lesson updated successfully!");
      setSelectedModule(null);
    } catch (error: any) {
      console.error("Error updating lesson:", error);
      toast.error(
        error.message || "Failed to update lesson. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveModule = async (
    updatedModule: Module,
    originalModuleTitle?: string,
    videoFile?: File,
    lessonIndex?: number
  ) => {
    if (!courseDetails) return;

    setIsUploading(true);
    try {
      let updatedModules: Module[];
      const moduleIndex = originalModuleTitle
        ? courseDetails.modules.findIndex(
            (module) => module.moduleTitle === originalModuleTitle
          )
        : courseDetails.modules.findIndex(
            (module) => module.moduleTitle === updatedModule.moduleTitle
          );

      const videoMapping: { [key: string]: number } = {};
      if (videoFile && lessonIndex !== undefined) {
        const lessonKey = `new-lesson-${moduleIndex}-${lessonIndex}`;
        videoMapping[lessonKey] = 0;
      }

      console.log("Constructed videoMapping:", videoMapping);

      if (moduleIndex !== -1) {
        updatedModules = [...courseDetails.modules];
        updatedModules[moduleIndex] = updatedModule;
      } else {
        updatedModules = [...courseDetails.modules, updatedModule];
      }

      const normalizedModules = normalizeVideoUrls(updatedModules);
      const formData = new FormData();
      formData.append(
        "courseData",
        JSON.stringify({ ...courseDetails, modules: normalizedModules })
      );
      if (videoFile) {
        formData.append("videos", videoFile);
        formData.append("videoMapping", JSON.stringify(videoMapping));
      }

      console.log("FormData contents:", {
        courseData: formData.get("courseData")?.toString(),
        videoMapping: formData.get("videoMapping")?.toString(),
        videos: formData.getAll("videos").map((f: File) => f.name),
      });

      await dispatch(
        editCourseAction({ courseId: courseDetails._id, formData })
      ).unwrap();
      toast.success("Module updated successfully!");
      setSelectedModule(null);
      setIsAddingNewModule(false);
    } catch (error: any) {
      console.error("Error updating module:", error);
      toast.error(
        error.message || "Failed to update module. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveModule = async (moduleTitle: string) => {
    if (!courseDetails) return;

    setIsUploading(true);
    try {
      const updatedModules = courseDetails.modules.filter(
        (module) => module.moduleTitle !== moduleTitle
      );

      const formData = new FormData();
      formData.append(
        "courseData",
        JSON.stringify({ ...courseDetails, modules: updatedModules })
      );

      await dispatch(
        editCourseAction({ courseId: courseDetails._id, formData })
      ).unwrap();
      toast.success("Module removed successfully!");
      setSelectedModule(null);
    } catch (error: any) {
      console.error("Error removing module:", error);
      toast.error(
        error.message || "Failed to remove module. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCourse = async (updatedCourse: ICourse) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      const courseData = {
        ...updatedCourse,
        modules: updatedCourse.modules || courseDetails?.modules || [],
      };
      formData.append("courseData", JSON.stringify(courseData));

      const response = await dispatch(
        editCourseAction({ courseId: updatedCourse._id, formData })
      ).unwrap();
      if (response) {
        toast.success("Course updated successfully!");
        setIsEditCourseModalOpen(false);
      }
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast.error(
        error.message || "Failed to update course. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddModule = () => {
    setIsAddingNewModule(true);
  };

  const handleAssessments = (moduleTitle: string) => {
    navigate(
      `/instructor/courses/${courseId}/modules/${encodeURIComponent(
        moduleTitle
      )}/assessments`
    );
  };

  const handleExams = () => {
    navigate(`/instructor/courses/${courseId}/exams`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-[#49BBBD]">Loading course details...</div>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Course not found</div>
      </div>
    );
  }

  const totalLessons = courseDetails.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const totalDuration = courseDetails.modules.reduce(
    (total, module) =>
      total +
      module.lessons.reduce(
        (lessonTotal, lesson) =>
          lessonTotal + (parseFloat(lesson.duration || "0") || 0),
        0
      ),
    0
  );

  // Placeholder for exam count (to be fetched from API in a real implementation)
  const totalExams = 0; // Replace with actual exam count if available

  return (
    <div className="flex h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar
        open={sidebarOpen}
        currentPage="courses"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        setCurrentPage={() => {}}
      />
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <button
                  onClick={() => navigate("/instructor/courses")}
                  className="text-gray-600 hover:text-gray-800 mr-4"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Course Details
                </h1>
              </div>
              <InstructorNavbar loading={false} error={null} />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={courseDetails.thumbnail}
                    alt="Course Thumbnail"
                    className="w-48 h-36 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {courseDetails.title}
                    </h2>
                    <p className="text-gray-600">{courseDetails.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="bg-[#49BBBD] text-white text-xs px-2 py-1 rounded">
                        {courseDetails.level}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {courseDetails.modules.length} Modules • {totalLessons}{" "}
                        Lessons
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Course Modules</h3>
                  <button
                    onClick={handleAddModule}
                    className="text-[#49bbbd] hover:bg-[#49bbbd] hover:text-white border border-[#49bbbd] px-3 py-1 rounded-md transition-colors"
                    disabled={isUploading}
                  >
                    Add Module
                  </button>
                </div>
                {courseDetails.modules.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No modules available. Add a module to get started.
                  </div>
                ) : (
                  courseDetails.modules.map((module, index) => (
                    <div
                      key={module.moduleTitle + index}
                      className="border-b last:border-b-0 py-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {module.moduleTitle}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {module.lessons.length} Lessons •{" "}
                            {module.lessons
                              .reduce(
                                (total, lesson) =>
                                  total +
                                  (parseFloat(lesson.duration || "0") || 0),
                                0
                              )
                              .toFixed(1)}
                            h
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2 text-right">
                          <button
                            onClick={() => setSelectedModule(module)}
                            className="text-[#49BBBD] hover:text-[#3a9a9c]"
                            disabled={isUploading}
                          >
                            View Module
                          </button>
                          <button
                            onClick={() =>
                              handleAssessments(module.moduleTitle)
                            }
                            className="text-[#49BBBD] hover:text-[#3a9a9c]"
                            disabled={isUploading}
                          >
                            Assessments
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Course Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instructor</span>
                    <span className="font-medium">
                      {courseDetails.instructorRef.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">
                      {courseDetails.categoryRef.categoryName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium">
                      {courseDetails.language}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pricing</span>
                    <span className="font-medium">
                      {courseDetails.pricing.type === "free"
                        ? "Free"
                        : `₹${courseDetails.pricing.amount}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Course Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#49BBBD]">
                      {totalLessons}
                    </div>
                    <div className="text-gray-600 text-sm">Total Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#49BBBD]">
                      {courseDetails.studentsEnrolled}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Enrolled Students
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#49BBBD]">
                      {totalExams}
                    </div>
                    <div className="text-gray-600 text-sm">Total Exams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#49BBBD]">
                      {totalDuration.toFixed(1)}h
                    </div>
                    <div className="text-gray-600 text-sm">Total Duration</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsEditCourseModalOpen(true)}
                    className="w-full bg-[#49BBBD] text-white py-2 rounded-md hover:bg-[#3a9a9c] transition-colors"
                    disabled={isUploading}
                  >
                    Edit Course
                  </button>
                  <button
                    onClick={handleExams}
                    className="w-full bg-[#49BBBD] text-white py-2 rounded-md hover:bg-[#3a9a9c] transition-colors"
                    disabled={isUploading}
                  >
                    Manage Exams
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        {(selectedModule || isAddingNewModule) && (
          <ModuleViewModal
            module={selectedModule || { moduleTitle: "", lessons: [] }}
            courseId={courseId}
            onClose={() => {
              setSelectedModule(null);
              setIsAddingNewModule(false);
            }}
            onSaveLesson={handleSaveLesson}
            onSaveModule={handleSaveModule}
            onRemoveModule={handleRemoveModule}
            isAddingNewModule={isAddingNewModule}
          />
        )}
        {isEditCourseModalOpen && (
          <EditCourseModal
            course={courseDetails}
            onClose={() => setIsEditCourseModalOpen(false)}
            onSave={handleSaveCourse}
          />
        )}
      </div>
    </div>
  );
};

export default CourseDetailsPage;