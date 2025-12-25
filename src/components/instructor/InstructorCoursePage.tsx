import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "../../redux/actions/auth/fetchUserdataAction";
import { getAllCoursesByInstructorAction } from "../../redux/actions/courseActions";
import { AppDispatch, RootState } from "../../redux/store";
import InstructorSidebar from "./InstructorSidebar";
import InstructorNavbar from "./InstructorNavbar";
import { SearchBar } from "../common/SearchBar";
import Pagination from "../common/Pagination";

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  modulesCount: number;
}

const InstructorCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const {
    data: reduxCourses = [],
    loading,
    error: reduxError,
    // currentPage = 1,
    totalPages = 1,
    // totalCourses = 0,
  } = useSelector((state: RootState) => state.course);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationError, setNavigationError] = useState<string | null>(null);

  const courses: Course[] = reduxCourses.map((course) => ({
    id: course._id,
    title: course.title,
    thumbnail: course.thumbnail,
    modulesCount: course.modules?.length ?? 0,
  }));

  useEffect(() => {
    if (location.state?.error) {
      setNavigationError(location.state.error);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchUserData()).unwrap();
      } catch (err) {
        const errorObj = err as { message?: string };
        console.error("Error fetching user data:", errorObj.message ?? err);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    dispatch(getAllCoursesByInstructorAction({ page, limit: 6, search: searchQuery }))
      .unwrap()
      .catch((err) => {
        const errorObj = err as { message?: string };
        console.error("Error fetching courses:", errorObj.message ?? err);
      });
  }, [dispatch, isAuthenticated, page, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleThumbnailClick = (courseId: string) => {
    navigate(`/instructor/courseDetails/${courseId}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <InstructorSidebar
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
                <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>
              </div>
              <div className="flex items-center space-x-4">
                <InstructorNavbar loading={loading} error={reduxError} />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {navigationError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{navigationError}</p>
              </div>
            </div>
          )}
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => navigate("/instructor/courses/create")}
              className="flex items-center gap-2 bg-[#49BBBD] hover:bg-[#3a9a9c] text-white py-2 px-4 rounded-md transition-colors"
            >
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
              Create Course
            </button>
            <div className="w-1/3">
              <SearchBar onSearchChange={handleSearchChange} />
            </div>
          </div>
          {loading && <p>Loading courses...</p>}
          {reduxError && <p className="text-red-500">{reduxError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={`${course.title} thumbnail`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleThumbnailClick(course.id)}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#49BBBD]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 017 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    <span>{course.modulesCount} Modules</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination is preserved */}
          {courses.length > 0 && !loading && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {courses.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                You haven't created any courses yet. Click the button below to get started.
              </p>
              <button
                onClick={() => navigate("/instructor/courses/create")}
                className="flex items-center gap-2 bg-[#49BBBD] hover:bg-[#3a9a9c] text-white py-2 px-4 rounded-md transition-colors"
              >
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
                Create Your First Course
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InstructorCoursesPage;