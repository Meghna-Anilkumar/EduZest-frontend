import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
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
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

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

// Define the period type explicitly
type Period = "day" | "month" | "year";

interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  activeCourses: number;
  totalRevenue: number;
  studentGrowth: { date: string; count: number }[];
  revenueOverview: { date: string; amount: number }[];
  topEnrolledCourses: {
    courseId: string;
    courseName: string;
    enrollmentCount: number;
    instructorName: string;
    thumbnail: string;
  }[];
}

interface CachedData {
  studentGrowth: { date: string; count: number }[];
  revenueOverview: { date: string; amount: number }[];
  topEnrolledCourses: DashboardStats["topEnrolledCourses"];
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

  const [dataCache, setDataCache] = useState<Record<Period, CachedData>>({} as Record<Period, CachedData>);

  const [filterPeriod, setFilterPeriod] = useState<Period>("day");

  const fetchDashboardStats = useCallback(
    async (period: Period) => {
      try {
        console.log(`Fetching data for period: ${period}`);

        // Use cached data if available
        if (dataCache[period]) {
          const cached = dataCache[period];
          setDashboardData((prev) => ({
            ...prev,
            stats: prev.stats ?? {
              totalStudents: 0,
              totalInstructors: 0,
              activeCourses: 0,
              totalRevenue: 0,
              studentGrowth: cached.studentGrowth,
              revenueOverview: cached.revenueOverview,
              topEnrolledCourses: cached.topEnrolledCourses,
            },
            studentGrowthStats: cached.studentGrowth,
            revenueOverviewStats: cached.revenueOverview,
            loading: false,
            error: null,
          }));
          return;
        }

        setDashboardData((prev) => ({ ...prev, loading: true, error: null }));

        const result = await dispatch(
          getDashboardStatsAction({ period }) // Removed `signal` – not supported unless explicitly added in action
        ).unwrap();

        const newStats: DashboardStats = result.data;

        // Cache the dynamic parts
        const cacheEntry: CachedData = {
          studentGrowth: newStats.studentGrowth,
          revenueOverview: newStats.revenueOverview,
          topEnrolledCourses: newStats.topEnrolledCourses,
        };

        setDataCache((prev) => ({
          ...prev,
          [period]: cacheEntry,
        }));

        setDashboardData({
          stats: newStats,
          studentGrowthStats: newStats.studentGrowth,
          revenueOverviewStats: newStats.revenueOverview,
          loading: false,
          error: null,
        });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch dashboard statistics";

        setDashboardData((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    },
    [dispatch, dataCache]
  );

  useEffect(() => {
    fetchDashboardStats(filterPeriod);
  }, [filterPeriod, fetchDashboardStats]);

  const getSliceLength = (period: Period): number => {
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
      labels: dashboardData.studentGrowthStats
        .slice(-getSliceLength(filterPeriod))
        .map((item) => item.date),
      datasets: [
        {
          label: "Student Growth",
          data: dashboardData.studentGrowthStats
            .slice(-getSliceLength(filterPeriod))
            .map((item) => item.count),
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
      labels: dashboardData.revenueOverviewStats
        .slice(-getSliceLength(filterPeriod))
        .map((item) => item.date),
      datasets: [
        {
          label: "Revenue Overview",
          data: dashboardData.revenueOverviewStats
            .slice(-getSliceLength(filterPeriod))
            .map((item) => item.amount),
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
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
    animation: { duration: 800 },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full z-30 sidebar-container">
        <Suspense
          fallback={
            <div className="w-64 h-full bg-white shadow-lg flex items-center justify-center">
              <div className="text-gray-500">Loading Sidebar...</div>
            </div>
          }
        >
          <Sidebar />
        </Suspense>
      </div>

      {/* Main Content */}
      <div className="flex-1 main-content transition-all duration-300">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>

          {dashboardData.loading ? (
            <div className="text-center text-gray-600 py-10">Loading statistics...</div>
          ) : dashboardData.error ? (
            <div className="text-center text-red-600 py-10">{dashboardData.error}</div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">Total Students</h2>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {dashboardData.stats?.totalStudents?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">Total Instructors</h2>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {dashboardData.stats?.totalInstructors?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">Active Courses</h2>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {dashboardData.stats?.activeCourses?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">Total Revenue</h2>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    ₹{dashboardData.stats?.totalRevenue?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              {/* Top Enrolled Courses */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Top Trending Courses
                </h2>
                {dashboardData.stats?.topEnrolledCourses?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.stats.topEnrolledCourses.map((course, index) => (
                      <div
                        key={course.courseId}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                      >
                        <img
                          src={course.thumbnail || "https://via.placeholder.com/400x200?text=No+Image"}
                          alt={course.courseName}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        <div className="p-5">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {index + 1}. {course.courseName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            By {course.instructorName}
                          </p>
                          <p className="text-base font-bold text-teal-600 mt-3">
                            {course.enrollmentCount.toLocaleString()} enrollments
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-10 rounded-lg shadow-md text-center">
                    <p className="text-gray-500">No courses enrolled yet.</p>
                  </div>
                )}
              </div>

              {/* Period Filter */}
              <div className="flex space-x-3 mb-6">
                {(["day", "month", "year"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setFilterPeriod(period)}
                    className={`px-5 py-2 rounded-lg font-medium capitalize transition-colors ${
                      filterPeriod === period
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {period === "day" ? "Last 30 Days" : period === "month" ? "Last 12 Months" : "Last 5 Years"}
                  </button>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Student Growth</h2>
                  <p className="text-sm text-gray-500 mb-6">New student registrations over time</p>
                  <div className="h-80">
                    <Line data={studentGrowthData} options={chartOptions} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Revenue Overview</h2>
                  <p className="text-sm text-gray-500 mb-6">Total earnings trend</p>
                  <div className="h-80">
                    <Line data={revenueOverviewData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Responsive Sidebar Margin Handling */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .sidebar-container ~ .main-content {
            margin-left: 16rem; /* w-64 = 16rem */
          }
        }
        @media (max-width: 1023px) {
          .sidebar-container ~ .main-content {
            margin-left: 5rem; /* w-20 = 5rem */
          }
        }
        @media (max-width: 640px) {
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;