import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getAssessmentByIdForStudentAction, submitAssessmentAction, getAssessmentResultAction } from "../../redux/actions/assessmentActions";
import Header from "../common/users/Header";
import StudentSidebar from "./StudentSidebar";
import ConfirmationModal from "../common/ConfirmationModal";
import { FileText, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { IAssessment } from "../../interface/IAssessment";

interface IAttempt {
  score: number;
  passed: boolean;
  completedAt: Date;
  answers: { questionId: string; selectedAnswer: string; isCorrect: boolean }[];
  _id?: string;
}

interface ISubmissionResult {
  score: number;
  totalPoints: number;
  passed: boolean;
  attempts: IAttempt[];
  status: "inProgress" | "failed" | "passed";
}

const AssessmentPlayer: React.FC = () => {
  const { courseId, assessmentId } = useParams<{ courseId: string; assessmentId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<IAssessment | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ISubmissionResult | null>(null);
  const [activeTab, setActiveTab] = useState("Assessments");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAssessmentAndResult = async () => {
      if (!assessmentId || !courseId) {
        console.log("AssessmentPlayer: Invalid assessment or course ID", { assessmentId, courseId });
        setError("Invalid assessment or course ID.");
        setLoading(false);
        return;
      }

      try {
        // Fetch assessment
        console.log("AssessmentPlayer: Dispatching getAssessmentByIdForStudentAction", { assessmentId });
        const assessmentResult = await dispatch(getAssessmentByIdForStudentAction({ assessmentId })).unwrap();
        console.log("AssessmentPlayer: Fetched assessment", assessmentResult);
        setAssessment(assessmentResult);

        // Fetch existing result
        console.log("AssessmentPlayer: Dispatching getAssessmentResultAction", { assessmentId });
        try {
          const existingResult = await dispatch(getAssessmentResultAction({ assessmentId })).unwrap();
          console.log("AssessmentPlayer: Existing result", existingResult);
          if (existingResult) {
            setSubmissionResult(existingResult);
          } else {
            // No result found, initialize answers for first submission
            setAnswers(
              assessmentResult.questions.map((question) => ({
                questionId: question.id,
                selectedAnswer: "",
              }))
            );
          }
        } catch (err: any) {
          if (err.message === "No submission found for this assessment.") {
            console.log("AssessmentPlayer: No prior submission, initializing answers");
            setAnswers(
              assessmentResult.questions.map((question) => ({
                questionId: question.id,
                selectedAnswer: "",
              }))
            );
          } else {
            console.error("AssessmentPlayer: Failed to fetch result:", err.message);
            setError(err.message || "Failed to load assessment result.");
          }
        }
      } catch (err: any) {
        console.error("AssessmentPlayer: Failed to fetch assessment:", err.message);
        setError(err.message || "Failed to load assessment.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentAndResult();
  }, [dispatch, assessmentId, courseId]);

  const handleOptionSelect = (questionId: string, selectedAnswer: string) => {
    console.log("AssessmentPlayer: Option selected", { questionId, selectedAnswer });
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId ? { ...answer, selectedAnswer } : answer
      )
    );
  };

  const handleSubmit = () => {
    if (!assessment || !assessmentId) {
      console.log("AssessmentPlayer: No assessment or assessmentId");
      setError("No assessment data available.");
      return;
    }

    const unanswered = answers.some((answer) => !answer.selectedAnswer);
    if (unanswered) {
      console.log("AssessmentPlayer: Unanswered questions detected", answers);
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsModalOpen(true);
  };

  const confirmSubmit = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("AssessmentPlayer: Submitting assessment", { assessmentId, answers });
      const response = await dispatch(submitAssessmentAction({ assessmentId, answers })).unwrap();
      console.log("AssessmentPlayer: Submission response", response);
      if (!response || typeof response.score !== "number" || !Array.isArray(response.attempts)) {
        throw new Error("Invalid submission response");
      }
      setSubmissionResult(response);
      setAnswers(
        assessment!.questions.map((question) => ({
          questionId: question.id,
          selectedAnswer: "",
        }))
      );
    } catch (err: any) {
      console.error("AssessmentPlayer: Failed to submit assessment:", err.message);
      setError(err.message || "Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    console.log("AssessmentPlayer: Resetting for new attempt");
    setSubmissionResult(null);
    setError(null);
    setAnswers(
      assessment!.questions.map((question) => ({
        questionId: question.id,
        selectedAnswer: "",
      }))
    );
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort attempts in reverse chronological order
  const sortedAttempts = submissionResult?.attempts
    ? [...submissionResult.attempts].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <div className="hidden md:block fixed top-[80px] left-0 h-[calc(100vh-80px)] w-64 z-30 overflow-y-auto bg-white shadow-md">
          <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <button
          className="md:hidden fixed top-20 left-4 z-40 bg-[#49BBBD] text-white p-2 rounded-md shadow-lg"
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
        <main className="flex-1 p-4 md:p-6 pt-24 md:ml-64 mt-16">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center text-gray-600">Loading assessment...</div>
            ) : assessment ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-[#49BBBD] mr-2" />
                  <h1 className="text-2xl font-bold text-gray-800">{assessment.title}</h1>
                </div>
                {assessment.description && (
                  <p className="text-gray-600 mb-6">{assessment.description}</p>
                )}
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {submissionResult ? (
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Assessment Results</h2>
                    <div className="mb-4">
                      <p className="text-gray-600 mb-2">
                        Overall Status:{" "}
                        {submissionResult.status === "passed" ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-5 w-5 mr-1" />
                            Passed
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <XCircle className="h-5 w-5 mr-1" />
                            Failed
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 mb-2">
                        Latest Score: {submissionResult.score} / {submissionResult.totalPoints}
                      </p>
                      <p className="text-gray-600 mb-4">
                        Total Attempts: {sortedAttempts.length}
                      </p>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Attempt History</h3>
                      {sortedAttempts.map((attempt, index) => (
                        <div
                          key={attempt._id || index}
                          className="border-b py-2 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-gray-600">
                              Attempt {sortedAttempts.length - index} - Score: {attempt.score} / {submissionResult.totalPoints}
                            </p>
                            <p className="text-sm text-gray-500">
                              Completed: {formatDate(attempt.completedAt)}
                            </p>
                          </div>
                          <p
                            className={`flex items-center ${
                              attempt.passed ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {attempt.passed ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Passed
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Failed
                              </>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {submissionResult.status !== "passed" && (
                        <button
                          className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                          onClick={handleTryAgain}
                        >
                          <RefreshCw className="h-5 w-5 mr-2" />
                          Try Again
                        </button>
                      )}
                      <button
                        className="bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                        onClick={() => navigate(`/student/learn/${courseId}`)}
                      >
                        Back to Course
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {assessment.questions.map((question, index) => (
                        <div key={question.id} className="border-b pb-4">
                          <h3 className="text-lg font-medium text-gray-700 mb-2">
                            Question {index + 1}: {question.text}
                          </h3>
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <label
                                key={option.id}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  checked={
                                    answers.find((a) => a.questionId === question.id)?.selectedAnswer === option.id
                                  }
                                  onChange={() => handleOptionSelect(question.id, option.id)}
                                  className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD]"
                                  disabled={isSubmitting}
                                />
                                <span className="text-gray-600">{option.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        className="bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Assessment"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-red-500">{error || "Failed to load assessment."}</div>
            )}
          </div>
        </main>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmSubmit}
        message="Are you sure you want to submit your assessment? This action cannot be undone."
      />
    </div>
  );
};

export default AssessmentPlayer;