import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Book, Clock, AlertCircle } from "lucide-react";
import { AppDispatch } from "../../redux/store";
import { getAllEnrollmentsAction } from "../../redux/actions/enrollmentActions";
import { getCourseProgressAction } from "../../redux/actions/assessmentActions";
import Header from "../common/users/Header";
import StudentSidebar from "./StudentSidebar";
import ProgressBar from "@ramonak/react-progress-bar";
import Pagination from "../common/Pagination";
import { SearchBar } from "../common/SearchBar";

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

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalEnrollments: number;
}

const MyCourses: React.FC = () => {
  const [activeTab, setActiveTab] = useState("My Courses");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState<{
    [courseId: string]: CourseProgress | null;
  }>({});
  const [paginationData, setPaginationData] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalEnrollments: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEnrollments = async (page: number = 1, search: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(
        getAllEnrollmentsAction({ page, limit: 6, search })
      ).unwrap();

      if (result.success) {
        setEnrollments(result.data.enrollments || []);
        setPaginationData({
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalEnrollments: result.data.totalEnrollments,
        });
      } else {
        setError(result.message || "Failed to fetch enrollments");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments(paginationData.currentPage, searchQuery);
  }, [paginationData.currentPage, searchQuery, dispatch]);

  useEffect(() => {
    const fetchProgress = async () => {
      for (const enrollment of enrollments) {
        if (enrollment.courseId?._id) {
          try {
            const result = await dispatch(
              getCourseProgressAction({ courseId: enrollment.courseId._id })
            ).unwrap();
            setCourseProgress((prev) => ({
              ...prev,
              [enrollment.courseId!._id]: result,
            }));
          } catch (err: any) {
            console.error(
              `Failed to fetch progress for course ${enrollment.courseId._id}`,
              err
            );
            setCourseProgress((prev) => ({
              ...prev,
              [enrollment.courseId!._id]: null,
            }));
          }
        }
      }
    };

    if (enrollments.length > 0) {
      fetchProgress();
    }
  }, [enrollments, dispatch]);

  const handlePageChange = (page: number) => {
    setPaginationData((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setPaginationData((prev) => ({ ...prev, currentPage: 1 }));
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const calculateTotalLessons = (course: CourseData): number => {
    return course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );
  };

  const formatEnrollmentDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string): string => {
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

  const getLevelBadgeClass = (level: string): string => {
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

        <main className="flex-1 p-4 md:p-6 pt-6 md:ml-64 mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">My Courses</h1>
              <div className="mt-4 md:mt-0 w-full md:w-64">
                <SearchBar onSearchChange={handleSearchChange} />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49BBBD]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            ) : enrollments.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((enrollment) => {
                    if (!enrollment.courseId || !enrollment.courseId.level) {
                      return null;
                    }

                    return (
                      <div
                        key={enrollment._id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={
                              enrollment.courseId.thumbnail ||
                              "/default-thumbnail.jpg"
                            }
                            alt={enrollment.courseId.title || "Course"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/default-thumbnail.jpg";
                            }}
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
                              {calculateTotalLessons(enrollment.courseId)}{" "}
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
                            {courseProgress[enrollment.courseId._id] ? (
                              <div className="mb-3">
                                <ProgressBar
                                  completed={
                                    courseProgress[enrollment.courseId._id]!
                                      .progress
                                  }
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
                            <Link
                              to={`/student/learn/${enrollment.courseId._id}`}
                              className="block w-full text-center bg-[#49BBBD] text-white py-2 rounded hover:bg-[#3a9a9c] transition-colors duration-300"
                            >
                              Continue Learning
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Always show pagination when courses are loaded, regardless of the total number of pages */}
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={paginationData.currentPage}
                    totalPages={paginationData.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
                
                {/* Show a page number indicator separately */}
                <div className="mt-2 text-center text-sm text-gray-500">
                  Page {paginationData.currentPage} of {paginationData.totalPages}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="flex justify-center mb-4">
                  <Book className="h-16 w-16 text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchQuery ? "No matching courses found" : "No courses yet"}
                </h2>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? "Try adjusting your search criteria."
                    : "You haven't enrolled in any courses yet."}
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

export default MyCourses;