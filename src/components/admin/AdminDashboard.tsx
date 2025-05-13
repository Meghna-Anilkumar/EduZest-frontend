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

const Sidebar = lazy(
  () => import("../../components/common/admin/AdminSidebar")
);

interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  activeCourses: number;
  totalRevenue: number;
  studentGrowth: { date: string; count: number }[];
  revenueOverview: { date: string; amount: number }[];
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
    };
  }>({});

  const [studentGrowthPeriod, setStudentGrowthPeriod] = useState<
    "day" | "month" | "year"
  >("day");
  const [revenueOverviewPeriod, setRevenueOverviewPeriod] = useState<
    "day" | "month" | "year"
  >("day");

  const fetchDashboardStats = useCallback(
    async (
      period: "day" | "month" | "year",
      target: "studentGrowth" | "revenueOverview" | "both"
    ) => {
      const controller = new AbortController();
      try {
        console.log(`Fetching data for period: ${period}, target: ${target}`);

        // Use cached data if available
        if (dataCache[period]) {
          setDashboardData((prev) => ({
            ...prev,
            ...(target === "both" && {
              stats: prev.stats || {
                totalStudents: 0,
                totalInstructors: 0,
                activeCourses: 0,
                totalRevenue: 0,
                studentGrowth: dataCache[period].studentGrowth,
                revenueOverview: dataCache[period].revenueOverview,
              },
              studentGrowthStats: dataCache[period].studentGrowth,
              revenueOverviewStats: dataCache[period].revenueOverview,
            }),
            ...(target === "studentGrowth" && {
              studentGrowthStats: dataCache[period].studentGrowth,
            }),
            ...(target === "revenueOverview" && {
              revenueOverviewStats: dataCache[period].revenueOverview,
            }),
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
          },
        }));

        setDashboardData((prev) => ({
          ...prev,
          ...(target === "both" && {
            stats: newStats,
            studentGrowthStats: newStats.studentGrowth,
            revenueOverviewStats: newStats.revenueOverview,
          }),
          ...(target === "studentGrowth" && {
            studentGrowthStats: newStats.studentGrowth,
          }),
          ...(target === "revenueOverview" && {
            revenueOverviewStats: newStats.revenueOverview,
          }),
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

  // Initial fetch
  useEffect(() => {
    fetchDashboardStats("day", "both");
  }, [fetchDashboardStats]);

  // Fetch student growth data when period changes
  useEffect(() => {
    fetchDashboardStats(studentGrowthPeriod, "studentGrowth");
  }, [studentGrowthPeriod, fetchDashboardStats]);

  // Fetch revenue overview data when period changes
  useEffect(() => {
    fetchDashboardStats(revenueOverviewPeriod, "revenueOverview");
  }, [revenueOverviewPeriod, fetchDashboardStats]);

  const getSliceLength = (period: "day" | "month" | "year") => {
    switch (period) {
      case "day":
        return 30; // Last 30 days
      case "month":
        return 12; // Last 12 months
      case "year":
        return 5; // Last 5 years
      default:
        return 30;
    }
  };

  const studentGrowthData = useMemo(
    () => ({
      labels:
        dashboardData.studentGrowthStats
          .slice(-getSliceLength(studentGrowthPeriod))
          .map((item) => item.date) || [],
      datasets: [
        {
          label: "Student Growth",
          data:
            dashboardData.studentGrowthStats
              .slice(-getSliceLength(studentGrowthPeriod))
              .map((item) => item.count) || [],
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          fill: true,
          tension: 0.1,
        },
      ],
    }),
    [dashboardData.studentGrowthStats, studentGrowthPeriod]
  );

  const revenueOverviewData = useMemo(
    () => ({
      labels:
        dashboardData.revenueOverviewStats
          .slice(-getSliceLength(revenueOverviewPeriod))
          .map((item) => item.date) || [],
      datasets: [
        {
          label: "Revenue Overview",
          data:
            dashboardData.revenueOverviewStats
              .slice(-getSliceLength(revenueOverviewPeriod))
              .map((item) => item.amount) || [],
          borderColor: "rgb(45, 212, 191)",
          backgroundColor: "rgba(45, 212, 191, 0.5)",
          fill: true,
          tension: 0.1,
        },
      ],
    }),
    [dashboardData.revenueOverviewStats, revenueOverviewPeriod]
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
    <div className="flex min-h-screen bg-gray-100">
      <Suspense fallback={<div>Loading Sidebar...</div>}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
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

            {/* Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Growth */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Student Growth
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-1 rounded ${
                        studentGrowthPeriod === "day"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setStudentGrowthPeriod("day")}
                    >
                      Day
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${
                        studentGrowthPeriod === "month"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setStudentGrowthPeriod("month")}
                    >
                      Month
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${
                        studentGrowthPeriod === "year"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setStudentGrowthPeriod("year")}
                    >
                      Year
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Track student enrollment over time
                </p>
                <div className="h-64">
                  <Line data={studentGrowthData} options={chartOptions} />
                </div>
              </div>

              {/* Revenue Overview */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Revenue Overview
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-1 rounded ${
                        revenueOverviewPeriod === "day"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setRevenueOverviewPeriod("day")}
                    >
                      Day
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${
                        revenueOverviewPeriod === "month"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setRevenueOverviewPeriod("month")}
                    >
                      Month
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${
                        revenueOverviewPeriod === "year"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setRevenueOverviewPeriod("year")}
                    >
                      Year
                    </button>
                  </div>
                </div>
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
  );
};

export default AdminDashboard;
