import React, { lazy, Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { getDashboardStatsAction } from "../../redux/actions/adminActions";
import { AppDispatch } from "../../redux/store";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Sidebar = lazy(() => import("../../components/common/admin/AdminSidebar"));

interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  activeCourses: number;
  totalRevenue: number;
  studentGrowth: { date: string; count: number }[];
  revenueOverview: { date: string; amount: number }[];
  topEnrolledCourses: { courseId: string; courseName: string; enrollmentCount: number; instructorName: string; thumbnail: string }[];
}

export const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats | null;
    studentGrowthStats: { date: string; count: number }[];
    revenueOverviewStats: { date: string; amount: number }[];
    loading: boolean;
    error: string | null;
  }>({
    stats: null,
    studentGrowthStats: [],
    revenueOverviewStats: [],
    loading: true,
    error: null,
  });

  const [dataCache, setDataCache] = useState<{
    [key: string]: {
      studentGrowth: { date: string; count: number }[];
      revenueOverview: { date: string; amount: number }[];
      topEnrolledCourses: { courseId: string; courseName: string; enrollmentCount: number; instructorName: string; thumbnail: string }[];
    };
  }>({});

  const [filterPeriod, setFilterPeriod] = useState<"day" | "month" | "year">("day");

  const fetchDashboardStats = useCallback(
    async (period: "day" | "month" | "year") => {
      const controller = new AbortController();
      try {
        console.log(`Fetching data for period: ${period}`);

        if (dataCache[period]) {
          setDashboardData((prev) => ({
            ...prev,
            stats: prev.stats || {
              totalStudents: 0,
              totalInstructors: 0,
              activeCourses: 0,
              totalRevenue: 0,
              studentGrowth: dataCache[period].studentGrowth,
              revenueOverview: dataCache[period].revenueOverview,
              topEnrolledCourses: dataCache[period].topEnrolledCourses,
            },
            studentGrowthStats: dataCache[period].studentGrowth,
            revenueOverviewStats: dataCache[period].revenueOverview,
            loading: false,
          }));
          return;
        }

        setDashboardData((prev) => ({ ...prev, loading: true }));
        const result = await dispatch(
          getDashboardStatsAction({ period, signal: controller.signal } as {
            period: "month" | "day" | "year";
            signal: AbortSignal;
          })
        ).unwrap();
        const newStats = result.data as DashboardStats;

        setDataCache((prev) => ({
          ...prev,
          [period]: {
            studentGrowth: newStats.studentGrowth,
            revenueOverview: newStats.revenueOverview,
            topEnrolledCourses: newStats.topEnrolledCourses,
          },
        }));

        setDashboardData((prev) => ({
          ...prev,
          stats: newStats,
          studentGrowthStats: newStats.studentGrowth,
          revenueOverviewStats: newStats.revenueOverview,
          loading: false,
          error: null,
        }));
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setDashboardData((prev) => ({
          ...prev,
          error: err.message || "Failed to fetch dashboard statistics",
          loading: false,
        }));
      }
      return () => controller.abort();
    },
    [dispatch, dataCache]
  );

  useEffect(() => {
    fetchDashboardStats(filterPeriod);
  }, [filterPeriod, fetchDashboardStats]);

  const getSliceLength = (period: "day" | "month" | "year") => {
    switch (period) {
      case "day":
        return 30;
      case "month":
        return 12;
      case "year":
        return 5;
      default:
        return 30;
    }
  };

  const studentGrowthData = useMemo(
    () => ({
      labels:
        dashboardData.studentGrowthStats
          .slice(-getSliceLength(filterPeriod))
          .map((item) => item.date) || [],
      datasets: [
        {
          label: "Student Growth",
          data:
            dashboardData.studentGrowthStats
              .slice(-getSliceLength(filterPeriod))
              .map((item) => item.count) || [],
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          fill: true,
          tension: 0.1,
        },
      ],
    }),
    [dashboardData.studentGrowthStats, filterPeriod]
  );

  const revenueOverviewData = useMemo(
    () => ({
      labels:
        dashboardData.revenueOverviewStats
          .slice(-getSliceLength(filterPeriod))
          .map((item) => item.date) || [],
      datasets: [
        {
          label: "Revenue Overview",
          data:
            dashboardData.revenueOverviewStats
              .slice(-getSliceLength(filterPeriod))
              .map((item) => item.amount) || [],
          borderColor: "rgb(45, 212, 191)",
          backgroundColor: "rgba(45, 212, 191, 0.5)",
          fill: true,
          tension: 0.1,
        },
      ],
    }),
    [dashboardData.revenueOverviewStats, filterPeriod]
  );

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { title: { display: false } },
      y: {
        beginAtZero: true,
        title: { display: false },
      },
    },
    animation: { duration: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full z-30 sidebar-container">
        <Suspense fallback={
          <div className="w-64 h-full bg-white shadow-lg flex items-center justify-center">
            <div>Loading Sidebar...</div>
          </div>
        }>
          <Sidebar />
        </Suspense>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 main-content">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          {dashboardData.loading ? (
            <div>Loading statistics...</div>
          ) : dashboardData.error ? (
            <div className="text-red-500">{dashboardData.error}</div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Total Students
                  </h2>
                  <p className="text-3xl font-bold text-blue-600">
                    {dashboardData.stats?.totalStudents || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Total Instructors
                  </h2>
                  <p className="text-3xl font-bold text-green-600">
                    {dashboardData.stats?.totalInstructors || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Active Courses
                  </h2>
                  <p className="text-3xl font-bold text-purple-600">
                    {dashboardData.stats?.activeCourses || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Total Revenue
                  </h2>
                  <p className="text-3xl font-bold text-yellow-600">
                    ₹{dashboardData.stats?.totalRevenue?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              {/* Top Enrolled Courses */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Top Trending Courses
                </h2>
                {dashboardData.stats?.topEnrolledCourses?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.stats.topEnrolledCourses.map((course, index) => (
                      <div
                        key={course.courseId}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        <img
                          src={course.thumbnail || "https://via.placeholder.com/300x150"}
                          alt={course.courseName}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {index + 1}. {course.courseName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Instructor: {course.instructorName}
                          </p>
                          <p className="text-sm font-semibold text-teal-600 mt-1">
                            {course.enrollmentCount} students enrolled
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-sm text-gray-500">No courses enrolled yet.</p>
                  </div>
                )}
              </div>

              {/* Filter Buttons Above Graphs */}
              <div className="flex space-x-2 mb-4">
                <button
                  className={`px-3 py-1 rounded ${
                    filterPeriod === "day"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setFilterPeriod("day")}
                >
                  Day
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    filterPeriod === "month"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setFilterPeriod("month")}
                >
                  Month
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    filterPeriod === "year"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setFilterPeriod("year")}
                >
                  Year
                </button>
              </div>

              {/* Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Growth */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Student Growth
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Track student enrollment over time
                  </p>
                  <div className="h-64">
                    <Line data={studentGrowthData} options={chartOptions} />
                  </div>
                </div>

                {/* Revenue Overview */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Revenue Overview
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Financial performance metrics
                  </p>
                  <div className="h-64">
                    <Line data={revenueOverviewData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS to handle dynamic margin */}
      <style>{`
        .sidebar-container:has(.w-64) ~ .main-content {
          margin-left: 16rem; /* 64 * 0.25rem = 16rem */
        }
        .sidebar-container:has(.w-20) ~ .main-content {
          margin-left: 5rem; /* 20 * 0.25rem = 5rem */
        }
        @media (max-width: 1024px) {
          .sidebar-container:has(.w-20) ~ .main-content {
            margin-left: 5rem;
          }
        }
        @media (max-width: 640px) {
          .main-content {
            margin-left: 0 !important; /* No margin on mobile when sidebar is not fixed */
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;