import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { getAllAssessmentsForCourseAction } from "../../redux/actions/assessmentActions";
import { getAssessmentResultAction } from "../../redux/actions/assessmentActions";
import { getCourseProgressAction } from "../../redux/actions/assessmentActions";
import { getCourseByIdAction } from "../../redux/actions/courseActions";
import Header from "../common/users/Header";
import StudentSidebar from "./StudentSidebar";
import Certificate from "./Certificate";
import { Trophy, Download, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface IAssessment {
  _id: string;
  title: string;
  moduleTitle: string;
  totalMarks: number;
}

interface IAssessmentResult {
  score: number;
  totalPoints: number;
  passed: boolean;
  attempts: {
    score: number;
    passed: boolean;
    completedAt: Date;
    answers: { questionId: string; selectedAnswer: string; isCorrect: boolean }[];
  }[];
  status: "inProgress" | "failed" | "passed";
}

interface CourseProgress {
  totalAssessments: number;
  passedAssessments: number;
  progress: number;
  completedAt?: string;
}

interface IInstructorRef {
  name: string;
  email: string;
  profile: { profilePic: string };
}

interface ICourse {
  _id: string;
  title: string;
  instructorRef?: IInstructorRef; // Updated to match the actual response structure
}

const CourseResults: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { userData } = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState("Course Progress");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [assessments, setAssessments] = useState<IAssessment[]>([]);
  const [results, setResults] = useState<{ [assessmentId: string]: IAssessmentResult | null }>({});
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [courseName, setCourseName] = useState<string>("");
  const [completionDate, setCompletionDate] = useState<string>("");
  const [instructorName, setInstructorName] = useState<string>("");

  const formatCertificateDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const getOrdinalSuffix = (day: number): string => {
      if (day % 10 === 1 && day !== 11) return "st";
      if (day % 10 === 2 && day !== 12) return "nd";
      if (day % 10 === 3 && day !== 13) return "rd";
      return "th";
    };

    return `${day}${getOrdinalSuffix(day)} day of ${month} ${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !userData?._id) {
        setError("Invalid course ID or user not authenticated.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const progressResult = await dispatch(
          getCourseProgressAction({ courseId })
        ).unwrap();
        setProgress(progressResult);

        const completedAt = progressResult.completedAt
          ? new Date(progressResult.completedAt)
          : new Date();
        setCompletionDate(formatCertificateDate(completedAt));

        const assessmentsResult = await dispatch(
          getAllAssessmentsForCourseAction({
            courseId,
            page: 1,
            limit: 100,
          })
        ).unwrap();
        setAssessments(assessmentsResult.assessments || []);

        const resultsData: { [assessmentId: string]: IAssessmentResult | null } = {};
        for (const assessment of assessmentsResult.assessments || []) {
          try {
            const result = await dispatch(
              getAssessmentResultAction({ assessmentId: assessment._id })
            ).unwrap();
            resultsData[assessment._id] = result;
          } catch (err) {
            resultsData[assessment._id] = null;
          }
        }
        setResults(resultsData);

        const courseResult = await dispatch(getCourseByIdAction(courseId)).unwrap();
        setCourseName(courseResult.title || "Unknown Course");
        setInstructorName(courseResult.instructorRef?.name || "Unknown Instructor"); // Access nested instructorRef.name
      } catch (err: any) {
        setError(err.message || "Failed to load course results.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, courseId, userData]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleDownloadCertificate = () => {
    setShowCertificate(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <div className="flex items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Course Results
              </h1>
              {progress && progress.progress === 100 && (
                <Trophy className="h-8 w-8 text-yellow-500 ml-4" />
              )}
            </div>

            {showCertificate ? (
              <Certificate
                studentName={userData?.name || "Student Name"}
                courseName={courseName}
                completionDate={completionDate}
                instructorName={instructorName}
              />
            ) : loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49BBBD]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            ) : assessments.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                {progress && progress.progress === 100 && (
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
                      <span className="text-lg font-semibold text-gray-700">
                        Congratulations! Course Completed
                      </span>
                    </div>
                    <button
                      onClick={handleDownloadCertificate}
                      className="flex items-center bg-[#49BBBD] text-white py-2 px-4 rounded hover:bg-[#3a9a9c] transition-colors duration-300"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Certificate
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-4 text-gray-700 font-semibold">Assessment</th>
                        <th className="p-4 text-gray-700 font-semibold">Module</th>
                        <th className="p-4 text-gray-700 font-semibold">Best Score</th>
                        <th className="p-4 text-gray-700 font-semibold">Status</th>
                        <th className="p-4 text-gray-700 font-semibold">Attempts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map((assessment) => {
                        const result = results[assessment._id];
                        return (
                          <tr
                            key={assessment._id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-4 text-gray-900">{assessment.title}</td>
                            <td className="p-4 text-gray-600">{assessment.moduleTitle}</td>
                            <td className="p-4 text-gray-600">
                              {result
                                ? `${result.attempts.reduce(
                                    (max, attempt) => Math.max(max, attempt.score),
                                    0
                                  )} / ${assessment.totalMarks}`
                                : "Not attempted"}
                            </td>
                            <td className="p-4">
                              {result ? (
                                result.status === "passed" ? (
                                  <span className="flex items-center text-green-600">
                                    <CheckCircle className="h-5 w-5 mr-1" />
                                    Passed
                                  </span>
                                ) : (
                                  <span className="flex items-center text-red-600">
                                    <XCircle className="h-5 w-5 mr-1" />
                                    {result.status === "failed" ? "Failed" : "In Progress"}
                                  </span>
                                )
                              ) : (
                                <span className="text-gray-600">Not attempted</span>
                              )}
                            </td>
                            <td className="p-4">
                              {result && result.attempts.length > 0 ? (
                                <div className="space-y-2">
                                  {result.attempts.map((attempt, index) => (
                                    <div
                                      key={index}
                                      className="text-sm text-gray-600"
                                    >
                                      Attempt {index + 1}: {attempt.score} / {assessment.totalMarks} (
                                      {attempt.passed ? "Passed" : "Failed"}, {formatDate(attempt.completedAt)})
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                "No attempts"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => navigate(`/student/progress`)}
                    className="bg-[#49BBBD] text-white py-2 px-4 rounded hover:bg-[#3a9a9c] transition-colors duration-300"
                  >
                    Back to Progress
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-16 w-16 text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No assessments found
                </h2>
                <p className="text-gray-500 mb-6">
                  There are no assessments for this course.
                </p>
                <button
                  onClick={() => navigate(`/student/progress`)}
                  className="inline-flex items-center bg-[#49BBBD] text-white px-4 py-2 rounded hover:bg-[#3a9a9c] transition-colors duration-300"
                >
                  Back to Progress
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseResults;