import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchUserData } from "../../redux/actions/auth/fetchUserdataAction";
import { getInstructorCourseStatsAction } from "../../redux/actions/enrollmentActions";
import Sidebar from "./InstructorSidebar";
import InstructorNavbar from "./InstructorNavbar";
import Pagination from "../common/Pagination";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the CourseStats interface
interface CourseStats {
  courseId: string;
  title: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  totalRevenue: number;
  averageProgress: number;
}

const InstructorDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

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
        navigate("/login");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await dispatch(fetchUserData()).unwrap();
        const statsResponse = await dispatch(getInstructorCourseStatsAction()).unwrap();
        console.log("Course Stats:", statsResponse.data); // Debug log
        setCourseStats(statsResponse.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch course statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, isAuthenticated, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Pagination logic
  const totalPages = Math.ceil(courseStats.length / itemsPerPage);
  const paginatedStats = courseStats.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Chart data for total enrollments and total revenue
  const chartData = {
    labels: courseStats.map((course) => course.title), // Course titles as x-axis labels
    datasets: [
      {
        label: "Total Enrollments",
        data: courseStats.map((course) => course.totalEnrollments),
        backgroundColor: "rgba(75, 192, 192, 0.5)", // Teal color
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Total Revenue ($)",
        data: courseStats.map((course) => course.totalRevenue),
        backgroundColor: "rgba(255, 99, 132, 0.5)", // Pink color
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };
  console.log("Chart Data:", chartData);

  // Chart options with fixed dimensions to prevent resizing issues
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This allows us to control the size with the parent container
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Course-wise Enrollments and Revenue",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Value",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Courses",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        open={sidebarOpen}
        currentPage={currentPage}
        onToggleSidebar={toggleSidebar}
        setCurrentPage={setCurrentPage}
      />

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
            <InstructorNavbar loading={loading} error={error} />
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Course-wise Statistics
              </h2>

              {/* Chart Section with fixed height */}
              {courseStats.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg">
                  <p className="text-gray-600 text-lg">No courses found. Create a course to see statistics here.</p>
                </div>
              ) : (
                <>
                  <div className="h-96 mb-8">
                    <Bar data={chartData} options={chartOptions} />
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-blue-700 text-lg font-semibold">Total Courses</h3>
                      <p className="text-2xl font-bold">{courseStats.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-green-700 text-lg font-semibold">Total Enrollments</h3>
                      <p className="text-2xl font-bold">
                        {courseStats.reduce((sum, course) => sum + course.totalEnrollments, 0)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-purple-700 text-lg font-semibold">Total Revenue</h3>
                      <p className="text-2xl font-bold">
                        ₹{courseStats.reduce((sum, course) => sum + course.totalRevenue, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-amber-700 text-lg font-semibold">Avg. Completion Rate</h3>
                      <p className="text-2xl font-bold">
                        {(courseStats.reduce((sum, course) => sum + course.completionRate, 0) / courseStats.length).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Enrollments
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completion Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg. Progress
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedStats.map((course) => (
                          <tr key={course.courseId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {course.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.totalEnrollments}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.completedEnrollments}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="mr-2">{course.completionRate}%</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${course.completionRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{course.totalRevenue.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="mr-2">{course.averageProgress}%</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${course.averageProgress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;