import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchUserData } from "../../redux/actions/auth/fetchUserdataAction";
import Sidebar from "./InstructorSidebar";
import InstructorNavbar from "./InstructorNavbar"; // Import the new component

const InstructorDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [sidebarOpen]);

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
  }, [dispatch, isAuthenticated]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        open={sidebarOpen}
        currentPage={currentPage}
        onToggleSidebar={toggleSidebar}
        setCurrentPage={setCurrentPage}
      />

      {/* Mobile overlay when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen && !isMobile ? "ml-64" : isMobile ? "ml-0" : "ml-20"
        }`}
      >
        {/* Top header */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-4 py-4">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="text-gray-600 focus:outline-none mr-4"
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
              )}
              <h1 className="text-xl font-semibold text-gray-800">
                Instructor Dashboard
              </h1>
            </div>
            {/* Use InstructorNavbar */}
            <InstructorNavbar loading={loading} error={error} />
          </div>
        </header>

        {/* Main content area */}
        <main className="p-6">
          {loading ? (
            <p className="text-center text-lg font-semibold">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Welcome to Instructor Dashboard
              </h2>
              <p className="text-gray-600">
                This is your centralized hub for managing courses, exams, and
                student communications.
              </p>

              {/* Dashboard content placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#49BBBD] bg-opacity-20 text-[#49BBBD]">
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
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg text-gray-800">
                        Active Courses
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">5</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#49BBBD] bg-opacity-20 text-[#49BBBD]">
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg text-gray-800">
                        Upcoming Exams
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#49BBBD] bg-opacity-20 text-[#49BBBD]">
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
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg text-gray-800">
                        New Messages
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;