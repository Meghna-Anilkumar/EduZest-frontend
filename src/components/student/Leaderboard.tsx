import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trophy, Filter } from "lucide-react";
import StudentSidebar from "./StudentSidebar";
import Header from "../common/users/Header";
import { AppDispatch, RootState } from "@/redux/store";
import { getLeaderboardAction, getStudentRankAction } from "@/redux/actions/examActions";
import { getAllEnrollmentsAction } from "@/redux/actions/enrollmentActions";
import { useSocket } from "@/components/context/socketContext";

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  totalScore: number;
}

interface Course {
  _id: string;
  title: string;
}

interface Enrollment {
  _id: string;
  userId: string;
  courseId: {
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    instructorRef?: string;
    categoryRef?: string;
  };
  enrolledAt: string;
  completionStatus: string;
  lessonProgress?: any[];
  isChatBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StudentRank {
  rank: number | null;
  totalScore: number | null;
}

const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Scoreboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentRank, setStudentRank] = useState<StudentRank>({ rank: null, totalScore: null });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { userData } = useSelector((state: RootState) => state.user);
  const { socket } = useSocket();

  // Fetch enrollments
  useEffect(() => {
    if (!userData?._id) {
      console.log("[Leaderboard] No user ID, skipping enrollments fetch");
      return;
    }

    dispatch(getAllEnrollmentsAction({ page: 1, limit: 10 }))
      .unwrap()
      .then((response) => {
        console.log("[Leaderboard] Raw enrollments response:", response);
        const enrollmentsArray = Array.isArray(response.data?.enrollments)
          ? response.data.enrollments
          : [];
        console.log("[Leaderboard] Enrollments array:", enrollmentsArray);
        setEnrollments(enrollmentsArray);
      })
      .catch((err) => {
        console.error("[Leaderboard] Failed to fetch enrollments:", err);
        setError(err.message || "Failed to fetch enrolled courses");
        setEnrollments([]);
      });
  }, [dispatch, userData?._id]);

  // Process enrollments to courses
  const courses: Course[] = Array.isArray(enrollments)
    ? enrollments
        .filter((enrollment) => {
          const hasCourseId = !!enrollment?.courseId?._id;
          const hasTitle = !!enrollment?.courseId?.title;
          console.log(
            "[Leaderboard] Filtering enrollment:",
            enrollment,
            "hasCourseId:",
            hasCourseId,
            "hasTitle:",
            hasTitle
          );
          return hasCourseId && hasTitle;
        })
        .map((enrollment) => {
          console.log("[Leaderboard] Mapping enrollment to course:", enrollment.courseId);
          return {
            _id: enrollment.courseId._id,
            title: enrollment.courseId.title,
          };
        })
    : [];
  console.log("[Leaderboard] Courses for dropdown:", courses);

  // Fetch leaderboard and student rank
  useEffect(() => {
    if (!userData?._id) {
      console.log("[Leaderboard] No user ID, skipping leaderboard and rank fetch");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log("[Leaderboard] Fetching for courseId:", selectedCourse !== "all" ? selectedCourse : "global");

    Promise.all([
      dispatch(
        getLeaderboardAction({
          courseId: selectedCourse !== "all" ? selectedCourse : undefined,
          limit: 10,
        })
      ).unwrap(),
      dispatch(
        getStudentRankAction({
          courseId: selectedCourse !== "all" ? selectedCourse : undefined,
        })
      ).unwrap(),
    ])
      .then(([leaderboardData, rankData]) => {
        console.log("[Leaderboard] Leaderboard fetched:", leaderboardData);
        console.log("[Leaderboard] Student rank fetched:", rankData);
        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
        setStudentRank(
          rankData
            ? { rank: rankData.rank, totalScore: rankData.totalScore }
            : { rank: null, totalScore: null }
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("[Leaderboard] Failed to fetch leaderboard or student rank:", err);
        setError(err.message || "Failed to fetch leaderboard or student rank");
        setLeaderboard([]);
        setStudentRank({ rank: null, totalScore: null });
        setLoading(false);
      });
  }, [dispatch, selectedCourse, userData?._id]);

  // Listen for real-time leaderboard updates via socket
  useEffect(() => {
    if (socket && userData?._id) {
      const handleLeaderboardUpdate = async (data: LeaderboardEntry[]) => {
        console.log("[Leaderboard] Real-time leaderboard update received:", data);
        const leaderboardData = Array.isArray(data) ? data : [];
        try {
          console.log("[Leaderboard] Fetching student rank for socket update, courseId:", selectedCourse !== "all" ? selectedCourse : "global");
          const rankData = await dispatch(
            getStudentRankAction({
              courseId: selectedCourse !== "all" ? selectedCourse : undefined,
            })
          ).unwrap();
          console.log("[Leaderboard] Student rank updated via socket:", rankData);
          setLeaderboard(leaderboardData);
          setStudentRank(
            rankData
              ? { rank: rankData.rank, totalScore: rankData.totalScore }
              : { rank: null, totalScore: null }
          );
        } catch (err) {
          console.error("[Leaderboard] Failed to fetch student rank on socket update:", err);
          setLeaderboard(leaderboardData);
          setStudentRank({ rank: null, totalScore: null });
        }
      };

      socket.on("leaderboard_updated", handleLeaderboardUpdate);

      return () => {
        socket.off("leaderboard_updated", handleLeaderboardUpdate);
      };
    }
  }, [socket, dispatch, selectedCourse, userData?._id]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("[Leaderboard] Course selected:", e.target.value);
    setSelectedCourse(e.target.value);
  };

  const selectedCourseTitle = courses.find((course) => course._id === selectedCourse)?.title || "All Courses";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="flex flex-1 pt-16 md:pt-20">
        {/* Sidebar */}
        <StudentSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile={isMobileMenuOpen}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:ml-64">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Leaderboard Header */}
            <div className="bg-gradient-to-r from-[#49bbbd] to-[#2a9d9f] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-white animate-pulse" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Leaderboard
                </h2>
              </div>
              <span className="text-sm text-white/80">
                Updated: June 5, 2025
              </span>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* <Filter className="w-5 h-5 text-gray-600" /> */}
                  <span className="text-sm font-medium text-gray-700">
                Select a Course
                  </span>
                  <select
                    value={selectedCourse}
                    onChange={handleCourseChange}
                    className="px-3 py-1.5 text-sm bg-white rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-[#49bbbd] focus:border-[#49bbbd]"
                  >
                    <option value="all">All Courses</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-sm text-gray-500">
                  {leaderboard.length} Students
                </span>
              </div>
            </div>

            {/* Student Rank */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-gray-800">
                    Your Rank in {selectedCourseTitle}
                  </span>
                  {studentRank.rank ? (
                    <span className="text-2xl font-bold text-[#49bbbd]">
                      #{studentRank.rank}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      No rank available (complete an exam to get ranked)
                    </span>
                  )}
                </div>
                {studentRank.totalScore !== null && (
                  <span className="text-sm font-medium text-gray-600">
                    Score: {studentRank.totalScore} pts
                  </span>
                )}
              </div>
            </div>

            {/* Leaderboard Content */}
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-4 border-[#49bbbd] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading leaderboard...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-600 text-lg">{error}</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">
                    No leaderboard data available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry) => (
                    <div
                      key={entry.studentId}
                      className={`flex items-center justify-between p-4 rounded-lg shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 ${
                        entry.studentId === userData?._id
                          ? "bg-[#49bbbd]/10 border-l-4 border-[#49bbbd]"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3 w-20">
                        {entry.rank === 1 && (
                          <span className="text-2xl">🏆</span>
                        )}
                        {entry.rank === 2 && (
                          <span className="text-2xl">🥈</span>
                        )}
                        {entry.rank === 3 && (
                          <span className="text-2xl">🥉</span>
                        )}
                        {entry.rank > 3 && (
                          <span className="text-lg font-semibold text-[#49bbbd]">
                            #{entry.rank}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-gray-800 font-medium text-sm sm:text-base truncate">
                          {entry.studentName}
                          {entry.studentId === userData?._id && (
                            <span className="text-xs text-[#49bbbd] ml-2">(You)</span>
                          )}
                        </p>
                      </div>
                      <div className="w-28 text-right">
                        <span className="text-gray-600 font-semibold text-sm sm:text-base">
                          {entry.totalScore}
                          <span className="text-xs text-gray-500"> pts</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Placeholder */}
            <div className="p-4 border-t border-gray-200 flex justify-center">
              <button
                disabled
                className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed hover:bg-gray-100"
              >
                Load More
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;