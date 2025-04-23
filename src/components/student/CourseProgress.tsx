import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Book, Clock, AlertCircle, Award } from "lucide-react";
import { AppDispatch } from "../../redux/store";
import { getAllEnrollmentsAction } from "../../redux/actions/enrollmentActions";
import { getCourseProgressAction } from "../../redux/actions/assessmentActions";
import Header from "../common/users/Header";
import StudentSidebar from "./StudentSidebar";
import ProgressBar from "@ramonak/react-progress-bar";

interface CourseData {
  _id: string;
  title: string;
  description: string;
  instructorRef: {
    _id: string;
    name: string;
    profile?: { profilePic?: string };
  };
  thumbnail: string;
  modules: Array<{
    moduleTitle: string;
    lessons: Array<{
      lessonNumber: string;
      title: string;
      duration?: string;
    }>;
  }>;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
}

interface EnrollmentData {
  _id: string;
  courseId: CourseData | null;
  enrolledAt: string;
  completionStatus: "enrolled" | "in-progress" | "completed";
}

interface CourseProgress {
  totalAssessments: number;
  passedAssessments: number;
  progress: number;
}

const CourseProgress: React.FC = () => {
  const [activeTab, setActiveTab] = useState("My Courses");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState<{
    [courseId: string]: CourseProgress | null;
  }>({});

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await dispatch(getAllEnrollmentsAction()).unwrap();
        if (result.success) {
          setEnrollments(result.data || []);
        } else {
          setError(result.message || "Failed to fetch enrollments");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch enrollments");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [dispatch]);

  useEffect(() => {
    const fetchProgress = async () => {
      for (const enrollment of enrollments) {
        if (enrollment.courseId?._id) {
          try {
            const result = await dispatch(
              getCourseProgressAction({ courseId: enrollment.courseId._id })
            ).unwrap();
            console.log(
              `CourseProgress: Progress fetched for course ${enrollment.courseId._id}`,
              result
            );
            setCourseProgress((prev) => ({
              ...prev,
              [enrollment.courseId._id]: result,
            }));
          } catch (err: any) {
            console.error(
              `CourseProgress: Failed to fetch progress for course ${enrollment.courseId._id}`,
              err
            );
            setCourseProgress((prev) => ({
              ...prev,
              [enrollment.courseId._id]: null,
            }));
          }
        }
      }
    };

    if (enrollments.length > 0) {
      fetchProgress();
    }
  }, [enrollments, dispatch]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const calculateTotalLessons = (course: CourseData) => {
    return course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );
  };

  const formatEnrollmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "enrolled":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <div className="hidden md:block fixed top-16 left-0 h-full w-64 z-30 overflow-y-auto bg-white shadow-md">
          <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <button
          className="md:hidden fixed top-20 left-4 z-40 bg-[#49BBBD] text-white p-2 rounded-md"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
          >
            <div
              className="absolute top-0 left-0 h-full w-64 bg-white z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <StudentSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobile={true}
                closeMobileMenu={closeMobileMenu}
              />
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 pt-6 md:ml-64 mt-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Course Progress</h1>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49BBBD]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>
                  Failed to load your progress. Please try again later.
                </span>
              </div>
            ) : enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment: EnrollmentData) => {
                  if (!enrollment.courseId || !enrollment.courseId.level) {
                    console.warn(
                      `Skipping enrollment ${enrollment._id}: Missing courseId or level`,
                      enrollment
                    );
                    return null;
                  }

                  const progressData = courseProgress[enrollment.courseId._id];
                  const isCompleted = progressData && progressData.progress === 100;

                  return (
                    <div
                      key={enrollment._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            enrollment.courseId.thumbnail ||
                            "default-thumbnail.jpg"
                          }
                          alt={enrollment.courseId.title || "Course"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${getLevelBadgeClass(
                              enrollment.courseId.level
                            )}`}
                          >
                            {enrollment.courseId.level.charAt(0).toUpperCase() +
                              enrollment.courseId.level.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {enrollment.courseId.title || "Untitled Course"}
                          </h2>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeClass(
                              enrollment.completionStatus
                            )}`}
                          >
                            {enrollment.completionStatus
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {enrollment.courseId.description ||
                            "No description available"}
                        </p>

                        <div className="flex items-center text-gray-500 text-xs mb-2">
                          <Book className="h-4 w-4 mr-1" />
                          <span>
                            {enrollment.courseId.modules
                              ? calculateTotalLessons(enrollment.courseId)
                              : 0}{" "}
                            lessons
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            {enrollment.courseId.language || "Unknown"}
                          </span>
                        </div>

                        <div className="flex items-center text-gray-500 text-xs mb-4">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            Enrolled on{" "}
                            {formatEnrollmentDate(enrollment.enrolledAt)}
                          </span>
                        </div>

                        <div className="mt-auto">
                          {progressData ? (
                            <div className="mb-3">
                              <ProgressBar
                                completed={progressData.progress}
                                bgColor="#006400"
                                labelAlignment="center"
                                labelColor="#ffffff"
                                height="20px"
                                labelSize="12px"
                                maxCompleted={100}
                              />
                            </div>
                          ) : (
                            <div className="mb-3">
                              <ProgressBar
                                completed={0}
                                bgColor="#d3d3d3"
                                labelAlignment="center"
                                labelColor="#ffffff"
                                height="20px"
                                labelSize="12px"
                                maxCompleted={100}
                                customLabel="Loading..."
                              />
                            </div>
                          )}
                          {isCompleted ? (
                            <Link
                              to={`/student/courses/${enrollment.courseId._id}/results`}
                              className="block w-full text-center bg-[#49BBBD] text-white py-2 rounded hover:bg-[#3a9a9c] transition-colors duration-300 flex items-center justify-center"
                            >
                              <Award className="h-5 w-5 mr-2" />
                              View Results
                            </Link>
                          ) : (
                            <Link
                              to={`/student/learn/${enrollment.courseId._id}`}
                              className="block w-full text-center bg-[#49BBBD] text-white py-2 rounded hover:bg-[#3a9a9c] transition-colors duration-300"
                            >
                              Continue Learning
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="flex justify-center mb-4">
                  <Book className="h-16 w-16 text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No progress yet
                </h2>
                <p className="text-gray-500 mb-6">
                  You haven't enrolled in any courses yet.
                </p>
                <Link
                  to="/all-courses"
                  className="inline-flex items-center bg-[#49BBBD] text-white px-4 py-2 rounded hover:bg-[#3a9a9c] transition-colors duration-300"
                >
                  Browse Courses
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseProgress;