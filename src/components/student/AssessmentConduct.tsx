import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch} from "../../redux/store";
import { getAssessmentByIdForStudentAction, submitAssessmentAction } from "../../redux/actions/assessmentActions";
import Header from "../common/users/Header";
import StudentSidebar from "./StudentSidebar";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { IAssessment } from "../../interface/IAssessment";

const AssessmentPlayer: React.FC = () => {
  const { courseId, assessmentId } = useParams<{ courseId: string; assessmentId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<IAssessment | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    totalPoints: number;
    passed: boolean;
    attempts: number;
    status: "inProgress" | "failed" | "passed";
  } | null>(null);
  const [activeTab, setActiveTab] = useState("Assessments");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId || !courseId) {
        console.log("AssessmentPlayer: Invalid assessment or course ID", { assessmentId, courseId });
        setError("Invalid assessment or course ID.");
        return;
      }

      try {
        console.log("AssessmentPlayer: Dispatching getAssessmentByIdForStudentAction", { assessmentId });
        const result = await dispatch(getAssessmentByIdForStudentAction({ assessmentId })).unwrap();
        console.log("AssessmentPlayer: Fetched assessment", result);
        setAssessment(result);
        setAnswers(
          result.questions.map((question) => ({
            questionId: question.id,
            selectedAnswer: "",
          }))
        );
      } catch (err: any) {
        console.error("AssessmentPlayer: Failed to fetch assessment:", err.message);
        setError(err.message || "Failed to load assessment.");
      }
    };

    fetchAssessment();
  }, [dispatch, assessmentId, courseId]);

  const handleOptionSelect = (questionId: string, selectedAnswer: string) => {
    console.log("AssessmentPlayer: Option selected", { questionId, selectedAnswer });
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId ? { ...answer, selectedAnswer } : answer
      )
    );
  };

  const handleSubmit = async () => {
    if (!assessment || !assessmentId) {
      console.log("AssessmentPlayer: No assessment or assessmentId");
      return;
    }

    const unanswered = answers.some((answer) => !answer.selectedAnswer);
    if (unanswered) {
      console.log("AssessmentPlayer: Unanswered questions detected", answers);
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log("AssessmentPlayer: Submitting assessment", { assessmentId, answers });
      const result = await dispatch(
        submitAssessmentAction({ assessmentId, answers })
      ).unwrap();
      console.log("AssessmentPlayer: Submission result", result);
      setSubmissionResult(result);
    } catch (err: any) {
      console.error("AssessmentPlayer: Failed to submit assessment:", err.message);
      setError(err.message || "Failed to submit assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
            {assessment ? (
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
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Assessment Submitted</h2>
                    <p className="text-gray-600 mb-2">
                      Score: {submissionResult.score} / {submissionResult.totalPoints}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {submissionResult.passed ? (
                        <span className="flex items-center justify-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          Passed
                        </span>
                      ) : (
                        <span className="flex items-center justify-center text-red-600">
                          <XCircle className="h-5 w-5 mr-1" />
                          Failed
                        </span>
                      )}
                    </p>
                    <button
                      className="bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                      onClick={() => navigate(`/courses/${courseId}`)}
                    >
                      Back to Course
                    </button>
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
                                    answers.find((a) => a.questionId === question.id)?.selectedAnswer ===
                                    option.id
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
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <div className="text-center text-gray-500">Loading assessment...</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentPlayer;
