import React, {
  useState,
  useEffect,
  useRef,
  Component,
  ErrorInfo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  getExamByIdForStudentAction,
  startExamAction,
  getExamResultAction,
  getExamProgressAction,
} from "../../redux/actions/examActions";
import { useSocket } from "../context/socketContext";
import Header from "../common/users/Header";
import StudentSidebar from "./StudentSidebar";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  FileCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import { IExam } from "../instructor/courses/ExamsPage";

interface IAttempt {
  score: number;
  passed: boolean;
  completedAt: Date;
  answers: {
    questionId: string;
    selectedAnswerIndex: number;
    isCorrect: boolean;
  }[];
  _id?: string;
}

interface ISubmissionResult {
  score: number;
  totalPoints: number;
  passed: boolean;
  attempts: IAttempt[];
  status: "inProgress" | "failed" | "passed";
}

interface IExamProgress {
  startTime?: string | null;
  answers: { questionId: string; selectedAnswerIndex: number }[];
  isSubmitted?: boolean;
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-700 p-4 bg-red-50 rounded">
          <h2 className="text-xl font-bold">Something went wrong.</h2>
          <p>{this.state.error?.message || "Unknown error occurred."}</p>
          <button
            className="mt-4 bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-semibold py-2 px-4 rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ExamConduct: React.FC = () => {
  const { courseId, examId } = useParams<{
    courseId: string;
    examId: string;
  }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { userData } = useSelector((state: RootState) => state.user);
  const [exam, setExam] = useState<IExam | null>(null);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedAnswerIndex: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<ISubmissionResult | null>(null);
  const [activeTab, setActiveTab] = useState("Exams");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchExamAndProgress = async () => {
      if (!examId || !courseId) {
        console.log("[ExamConduct] Invalid exam or course ID", {
          examId,
          courseId,
        });
        setError("Invalid exam or course ID.");
        setLoading(false);
        return;
      }

      try {
        console.log("[ExamConduct] Fetching exam data", { examId });
        const examResult = await dispatch(
          getExamByIdForStudentAction({ examId })
        ).unwrap();
        console.log("[ExamConduct] Fetched exam", examResult);
        setExam(examResult);

        if (!examResult.questions || examResult.questions.length === 0) {
          setError("No questions found for this exam.");
          setLoading(false);
          return;
        }
        if (!examResult.duration) {
          setError("Exam duration not set.");
          setLoading(false);
          return;
        }

        const initialAnswers = examResult.questions.map((q: any) => ({
          questionId: q.id,
          selectedAnswerIndex: -1,
        }));

        try {
          console.log("[ExamConduct] Fetching exam progress", { examId });
          const progress = await dispatch(
            getExamProgressAction({ examId })
          ).unwrap();
          console.log("[ExamConduct] Fetched progress", progress);

          if (progress.isSubmitted) {
            console.log("[ExamConduct] Exam is submitted, fetching results");
            const existingResult = await dispatch(
              getExamResultAction({ examId })
            ).unwrap();
            if (existingResult) {
              const mappedResult: ISubmissionResult = {
                ...existingResult,
                attempts:
                  existingResult.attempts?.map((attempt: any) => ({
                    ...attempt,
                    _id: attempt.id,
                  })) || [],
                score: existingResult.score ?? 0,
                totalPoints: existingResult.totalPoints ?? 0,
                passed: existingResult.passed ?? false,
                status: existingResult.status ?? "failed",
              };
              setSubmissionResult(mappedResult);
              setExamStarted(false);
              setTimeRemaining(null);
              setStartTime(null);
              setAnswers(initialAnswers);
              setLoading(false);
              return;
            }
          } else if (progress.startTime) {
            console.log("[ExamConduct] Resuming in-progress exam");
            setExamStarted(true);
            setStartTime(progress.startTime);
            const elapsedSeconds = Math.floor(
              (new Date().getTime() - new Date(progress.startTime).getTime()) /
                1000
            );
            const totalSeconds = examResult.duration * 60;
            const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

            setTimeRemaining(remainingSeconds);

            const resumedAnswers = examResult.questions.map((q: any) => {
              const savedAnswer = progress.answers.find(
                (a: any) => a.questionId === q.id
              );
              return {
                questionId: q.id,
                selectedAnswerIndex: savedAnswer
                  ? savedAnswer.selectedAnswerIndex
                  : -1,
              };
            });
            setAnswers(resumedAnswers);
            console.log("[ExamConduct] Resumed answers", resumedAnswers);

            try {
              const existingResult = await dispatch(
                getExamResultAction({ examId })
              ).unwrap();
              console.log(
                "[ExamConduct] Fetched existing result",
                existingResult
              );
              if (existingResult && progress.isSubmitted) {
                const mappedResult: ISubmissionResult = {
                  ...existingResult,
                  attempts:
                    existingResult.attempts?.map((attempt: any) => ({
                      ...attempt,
                      _id: attempt.id,
                    })) || [],
                  score: existingResult.score ?? 0,
                  totalPoints: existingResult.totalPoints ?? 0,
                  passed: existingResult.passed ?? false,
                  status: existingResult.status ?? "failed",
                };
                setSubmissionResult(mappedResult);
              }
            } catch (resultErr) {
              console.log(
                "[ExamConduct] No prior submission found or error",
                resultErr
              );
            }
          } else {
            console.log(
              "[ExamConduct] No progress found, initializing new exam"
            );
            setExamStarted(false);
            setStartTime(null);
            setTimeRemaining(null);
            setAnswers(initialAnswers);

            try {
              const existingResult = await dispatch(
                getExamResultAction({ examId })
              ).unwrap();
              console.log(
                "[ExamConduct] Fetched existing result",
                existingResult
              );
              if (existingResult) {
                const mappedResult: ISubmissionResult = {
                  ...existingResult,
                  attempts:
                    existingResult.attempts?.map((attempt: any) => ({
                      ...attempt,
                      _id: attempt.id,
                    })) || [],
                  score: existingResult.score ?? 0,
                  totalPoints: existingResult.totalPoints ?? 0,
                  passed: existingResult.passed ?? false,
                  status: existingResult.status ?? "failed",
                };
                setSubmissionResult(mappedResult);
              }
            } catch (resultErr) {
              console.log(
                "[ExamConduct] No prior submission found or error",
                resultErr
              );
            }
          }
        } catch (progressErr) {
          if (progressErr.message === "No progress found.") {
            console.log(
              "[ExamConduct] No progress found, initializing new exam"
            );
            setExamStarted(false);
            setStartTime(null);
            setTimeRemaining(null);
            setAnswers(initialAnswers);

            try {
              const existingResult = await dispatch(
                getExamResultAction({ examId })
              ).unwrap();
              console.log(
                "[ExamConduct] Fetched existing result",
                existingResult
              );
              if (existingResult) {
                const mappedResult: ISubmissionResult = {
                  ...existingResult,
                  attempts:
                    existingResult.attempts?.map((attempt: any) => ({
                      ...attempt,
                      _id: attempt.id,
                    })) || [],
                  score: existingResult.score ?? 0,
                  totalPoints: existingResult.totalPoints ?? 0,
                  passed: existingResult.passed ?? false,
                  status: existingResult.status ?? "failed",
                };
                setSubmissionResult(mappedResult);
              }
            } catch (resultErr) {
              console.log(
                "[ExamConduct] No prior submission found or error",
                resultErr
              );
            }
          } else {
            console.error(
              "[ExamConduct] Failed to fetch progress:",
              progressErr
            );
            setError(progressErr.message || "Failed to load exam progress.");
          }
        }
      } catch (err) {
        console.error("[ExamConduct] Failed to fetch exam:", err);
        setError(err.message || "Failed to load exam.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamAndProgress();
  }, [dispatch, examId, courseId]);

  useEffect(() => {
    if (!socket) return;

    let cleanup: (() => void) | undefined;

    const setupSocketListeners = () => {
      console.log("[ExamConduct] Setting up socket listeners", { isConnected });

      const handleExamStarted = (data: any) => {
        console.log("[ExamConduct] Exam started:", data);
        setExamStarted(true);
        setStartTime(data.startTime);
        if (exam?.duration) {
          setTimeRemaining(exam.duration * 60);
        } else {
          console.warn("[ExamConduct] Exam duration undefined:", exam);
          setError("Exam duration not set. Please contact support.");
        }
        if (
          data?.answers &&
          Array.isArray(data.answers) &&
          data.answers.length > 0
        ) {
          setAnswers(data.answers);
        } else if (exam?.questions) {
          const initialAnswers = exam.questions.map((q: any) => ({
            questionId: q.id,
            selectedAnswerIndex: -1,
          }));
          setAnswers(initialAnswers);
        }
      };

      const handleExamSubmitted = async (response: any) => {
        console.log("[ExamConduct] Exam submitted:", response);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          console.log(
            "[ExamConduct] Timer cleared on exam submission (socket)"
          );
        }

        if (response.success && response.data) {
          const mappedResult: ISubmissionResult = {
            score: response.data.score ?? 0,
            totalPoints: response.data.totalPoints ?? 0,
            passed: response.data.passed ?? false,
            attempts: Array.isArray(response.data.responses)
              ? response.data.responses.map((attempt: any) => ({
                  ...attempt,
                  _id: attempt.id,
                  completedAt: attempt.completedAt || new Date(),
                  answers: Array.isArray(attempt.responses)
                    ? attempt.responses
                    : [],
                }))
              : [],
            status: response.data.status ?? "failed",
          };
          setSubmissionResult(mappedResult);

          if (exam?.questions) {
            setAnswers(
              exam.questions.map((question: any) => ({
                questionId: question.id,
                selectedAnswerIndex: -1,
              }))
            );
          } else {
            setAnswers([]);
          }

          setExamStarted(false);
          setTimeRemaining(null);
          setStartTime(null);

          try {
            const result = await dispatch(
              getExamResultAction({ examId })
            ).unwrap();
            const updatedResult: ISubmissionResult = {
              ...result,
              attempts: Array.isArray(result.attempts)
                ? result.attempts.map((attempt: any) => ({
                    ...attempt,
                    _id: attempt.id,
                  }))
                : [],
              score: result.score ?? 0,
              totalPoints: result.totalPoints ?? 0,
              passed: result.passed ?? false,
              status: result.status ?? "failed",
            };
            setSubmissionResult(updatedResult);
          } catch (err) {
            console.error(
              "[ExamConduct] Failed to fetch result post-submission:",
              err
            );
            setError("Failed to load exam result.");
          }
        } else {
          setError(response.message || "Failed to submit exam.");
        }
        setIsSubmitting(false);
      };

      const handleExamAutoSubmitted = async (response: any) => {
        console.log("[ExamConduct] Exam auto-submitted:", response);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          console.log(
            "[ExamConduct] Timer cleared on exam auto-submission (socket)"
          );
        }

        if (response.success && response.data) {
          const mappedResult: ISubmissionResult = {
            score: response.data.score ?? 0,
            totalPoints: response.data.totalPoints ?? 0,
            passed: response.data.passed ?? false,
            attempts: Array.isArray(response.data.responses)
              ? response.data.responses.map((attempt: any) => ({
                  ...attempt,
                  _id: attempt.id,
                  completedAt: attempt.completedAt || new Date(),
                  answers: Array.isArray(attempt.responses)
                    ? attempt.responses
                    : [],
                }))
              : [],
            status: response.data.status ?? "failed",
          };
          setSubmissionResult(mappedResult);
          setExamStarted(false);
          setTimeRemaining(null);
          setStartTime(null);
          setError("Time's up! Your exam has been auto-submitted.");

          try {
            const result = await dispatch(
              getExamResultAction({ examId })
            ).unwrap();
            const updatedResult: ISubmissionResult = {
              ...result,
              attempts: Array.isArray(result.attempts)
                ? result.attempts.map((attempt: any) => ({
                    ...attempt,
                    _id: attempt.id,
                  }))
                : [],
              score: result.score ?? 0,
              totalPoints: result.totalPoints ?? 0,
              passed: result.passed ?? false,
              status: result.status ?? "failed",
            };
            setSubmissionResult(updatedResult);
          } catch (err) {
            console.error(
              "[ExamConduct] Failed to fetch result post-auto-submission:",
              err
            );
            setError("Failed to load exam result.");
          }
        } else {
          setError(response.message || "Failed to auto-submit exam.");
        }
        setIsSubmitting(false);
      };

      const handleError = (data: any) => {
        console.error("[ExamConduct] Socket error:", data.message);
        setError(data.message || "Socket error occurred.");
      };

      socket.on("examStarted", handleExamStarted);
      socket.on("examSubmitted", handleExamSubmitted);
      socket.on("examAutoSubmitted", handleExamAutoSubmitted);
      socket.on("error", handleError);
      socket.on("progressSaved", (data) => {
        console.log("[ExamConduct] Progress saved:", data);
      });
      socket.on("testResponse", (data) => {
        console.log("[ExamConduct] Test response received:", data);
      });

      return () => {
        socket.off("examStarted", handleExamStarted);
        socket.off("examSubmitted", handleExamSubmitted);
        socket.off("examAutoSubmitted", handleExamAutoSubmitted);
        socket.off("error", handleError);
        socket.off("progressSaved");
        socket.off("testResponse");
      };
    };

    if (isConnected) {
      cleanup = setupSocketListeners();
      socket.emit("testConnection", { message: "Testing socket connection" });
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [socket, isConnected, examId, userData, exam, dispatch]);

  useEffect(() => {
    if (
      examStarted &&
      timeRemaining !== null &&
      timeRemaining > 0 &&
      startTime
    ) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev !== null && prev > 0) {
            const elapsedSeconds = Math.floor(
              (new Date().getTime() - new Date(startTime).getTime()) / 1000
            );
            const totalSeconds = exam?.duration ? exam.duration * 60 : 0;
            const newTime = Math.max(0, totalSeconds - elapsedSeconds);

            if (socket && isConnected && examId && newTime % 10 === 0) {
              console.log("[ExamConduct] Saving progress periodically:", {
                examId,
                answers,
              });
              socket.emit("saveExamProgress", { examId, answers, startTime });
            }

            if (newTime <= 0) {
              console.log("[ExamConduct] Timer reached 0 - auto-submitting");
              handleAutoSubmit();
              return 0;
            }
            return newTime;
          }
          return 0;
        });
      }, 1000);
    } else if (timeRemaining === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log("[ExamConduct] Timer cleared");
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        console.log("[ExamConduct] Timer cleared on cleanup");
      }
    };
  }, [
    examStarted,
    timeRemaining,
    socket,
    isConnected,
    examId,
    answers,
    startTime,
    exam?.duration,
  ]);

  useEffect(() => {
    console.log("[ExamConduct] Answers state updated", answers);
  }, [answers]);

  const handleStartExam = async () => {
    console.log("[ExamConduct] handleStartExam called", {
      examId,
      isConnected,
      socket: !!socket,
    });
    if (!examId || !exam) {
      setError("Invalid exam ID.");
      console.log("[ExamConduct] Invalid exam ID", { examId });
      return false;
    }

    if (!socket || !isConnected) {
      setError("Cannot start exam. Socket not connected.");
      console.log("[ExamConduct] Start exam failed", {
        socket: !!socket,
        isConnected,
      });
      return false;
    }

    try {
      console.log("[ExamConduct] Fetching exam progress", { examId });
      const progress = await dispatch(
        getExamProgressAction({ examId })
      ).unwrap();
      console.log("[ExamConduct] Fetched progress", progress);

      if (progress.startTime && !progress.isSubmitted) {
        console.log("[ExamConduct] Resuming existing exam");
        setExamStarted(true);
        setStartTime(progress.startTime);
        const elapsedSeconds = Math.floor(
          (new Date().getTime() - new Date(progress.startTime).getTime()) / 1000
        );
        const totalSeconds = exam?.duration ? exam.duration * 60 : 0;
        const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

        setTimeRemaining(remainingSeconds);

        const initialAnswers =
          exam?.questions.map((q: any) => {
            const savedAnswer = progress.answers?.find(
              (a: any) => a.questionId === q.id
            );
            return {
              questionId: q.id,
              selectedAnswerIndex: savedAnswer
                ? savedAnswer.selectedAnswerIndex
                : -1,
            };
          }) || [];
        setAnswers(initialAnswers);
        console.log("[ExamConduct] Resumed answers", initialAnswers);
        return true;
      }

      console.log("[ExamConduct] Starting new exam", { examId });
      const response = await dispatch(startExamAction({ examId })).unwrap();
      console.log("[ExamConduct] startExamAction response", response);

      socket.emit("startExam", { examId });
      console.log("[ExamConduct] Emitted startExam socket event", { examId });

      const initialAnswers =
        exam?.questions.map((q: any) => ({
          questionId: q.id,
          selectedAnswerIndex: -1,
        })) || [];
      setAnswers(initialAnswers);
      console.log("[ExamConduct] Initialized answers", initialAnswers);

      setStartTime(response.startTime);
      setExamStarted(true);
      setTimeRemaining(exam?.duration ? exam.duration * 60 : 0);

      return true;
    } catch (err: any) {
      console.error("[ExamConduct] Failed to start exam:", err);
      if (err.message === "No progress found.") {
        console.log("[ExamConduct] No progress found, starting new exam");
        const response = await dispatch(startExamAction({ examId })).unwrap();
        socket.emit("startExam", { examId });
        const initialAnswers =
          exam?.questions.map((q: any) => ({
            questionId: q.id,
            selectedAnswerIndex: -1,
          })) || [];
        setAnswers(initialAnswers);
        setStartTime(response.startTime);
        setExamStarted(true);
        setTimeRemaining(exam?.duration ? exam.duration * 60 : 0);
        return true;
      } else {
        setError(err.message || "Failed to start exam. Please try again.");
        return false;
      }
    }
  };

  const handleAutoSubmit = async () => {
    if (!socket || !examId) {
      setError("Socket not connected or invalid exam ID.");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log("[ExamConduct] Timer cleared on auto-submission");
    }

    try {
      console.log("[ExamConduct] Auto-submitting exam", { examId, answers });
      socket.emit("submitExam", { examId, answers }, async (response: any) => {
        console.log("[ExamConduct] Auto-submit response:", response);
        if (response.success) {
          try {
            const result = await dispatch(
              getExamResultAction({ examId })
            ).unwrap();
            const mappedResult: ISubmissionResult = {
              ...result,
              attempts: Array.isArray(result.attempts)
                ? result.attempts.map((attempt: any) => ({
                    ...attempt,
                    _id: attempt.id,
                  }))
                : [],
              score: result.score ?? 0,
              totalPoints: result.totalPoints ?? 0,
              passed: result.passed ?? false,
              status: result.status ?? "failed",
            };
            setSubmissionResult(mappedResult);
            setError("Time's up! Your exam has been auto-submitted.");
            setExamStarted(false);
            setTimeRemaining(null);
            setStartTime(null);
          } catch (err) {
            console.error(
              "[ExamConduct] Failed to fetch result post-auto-submission:",
              err
            );
            setError("Failed to load exam result.");
          }
        } else {
          setError(response.message || "Failed to auto-submit exam.");
        }
        setIsSubmitting(false);
      });
    } catch (err: any) {
      console.error("[ExamConduct] Auto-submit failed:", err);
      setError(err.message || "Failed to auto-submit exam.");
      setIsSubmitting(false);
    }
  };
  const handleOptionSelect = (
    questionId: string,
    selectedAnswerIndex: number
  ) => {
    console.log("[ExamConduct] Option selected:", {
      questionId,
      selectedAnswerIndex,
    });
    setAnswers((prev) => {
      const updatedAnswers = prev.some((a) => a.questionId === questionId)
        ? prev.map((a) =>
            a.questionId === questionId ? { ...a, selectedAnswerIndex } : a
          )
        : [...prev, { questionId, selectedAnswerIndex }];
      console.log("[ExamConduct] Updated answers:", updatedAnswers);
      if (socket && isConnected && examId) {
        console.log("[ExamConduct] Saving progress on option select:", {
          examId,
          updatedAnswers,
        });
        socket.emit(
          "saveExamProgress",
          { examId, answers: updatedAnswers, startTime },
          (response: any) => {
            console.log("[ExamConduct] Save progress response:", response);
            if (response && !response.success) {
              setError(response.message || "Failed to save progress.");
            }
          }
        );
      }
      return updatedAnswers;
    });
  };

  const handleSubmit = () => {
    if (!exam || !examId) {
      console.log("[ExamConduct] No exam or examId");
      setError("No exam data available.");
      return;
    }

    if (!exam.questions || exam.questions.length === 0) {
      console.log("[ExamConduct] No questions available");
      setError("No questions available for this exam.");
      return;
    }

    const unanswered = answers.some(
      (answer) => answer.selectedAnswerIndex === -1
    );
    if (unanswered) {
      console.log("[ExamConduct] Unanswered questions detected", answers);
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsModalOpen(true);
  };

  const confirmSubmit = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);
    setError(null);

    // Clear the timer before submitting
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log("[ExamConduct] Timer cleared on manual submission");
    }

    if (!socket || !examId) {
      setError("Socket not connected or invalid exam ID.");
      setIsSubmitting(false);
      console.log("[ExamConduct] Submit exam failed", {
        socket: !!socket,
        examId,
      });
      return;
    }

    try {
      console.log("[ExamConduct] Emitting submitExam socket event", {
        examId,
        answers,
      });
      socket.emit("submitExam", { examId, answers });
    } catch (err) {
      console.error("[ExamConduct] Failed to submit exam:", err);
      setError(err.message || "Failed to submit exam. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = async () => {
    console.log("[ExamConduct] Resetting for new attempt");
    setSubmissionResult(null);
    setError(null);
    setExamStarted(false);
    setTimeRemaining(null);
    setStartTime(null);
    setAnswers(
      exam?.questions && exam.questions.length > 0
        ? exam.questions.map((question) => ({
            questionId: question.id,
            selectedAnswerIndex: -1,
          }))
        : []
    );

    // Start a new exam attempt
    if (examId && exam) {
      try {
        console.log("[ExamConduct] Starting new attempt", { examId });
        const response = await dispatch(startExamAction({ examId })).unwrap();
        console.log("[ExamConduct] startExamAction response", response);
        socket?.emit("startExam", { examId });
        console.log(
          "[ExamConduct] Emitted startExam socket event for try again",
          { examId }
        );

        setStartTime(response.startTime);
        setExamStarted(true);
        setTimeRemaining(exam.duration ? exam.duration * 60 : 0);
        console.log("[ExamConduct] New timer started for try again", {
          duration: exam.duration,
        });
      } catch (err) {
        console.error("[ExamConduct] Failed to start new attempt:", err);
        setError(
          err.message || "Failed to start new attempt. Please try again."
        );
      }
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const sortedAttempts = submissionResult?.attempts
    ? [...submissionResult.attempts].sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
    : [];

  return (
    <ErrorBoundary>
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
                <div className="text-center text-gray-600">Loading exam...</div>
              ) : exam ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FileCheck className="h-6 w-6 text-[#49BBBD] mr-2" />
                      <h1 className="text-2xl font-bold text-gray-800">
                        {exam.title}
                      </h1>
                    </div>
                    {examStarted &&
                      timeRemaining !== null &&
                      timeRemaining > 0 && (
                        <div className="fixed top-20 right-4 md:right-6 z-50 flex items-center p-2 bg-white rounded-md shadow-md">
                          <Clock
                            className={`h-5 w-5 mr-2 ${
                              timeRemaining <= 60
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`font-semibold ${
                              timeRemaining <= 60
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            Time Remaining: {formatTimeRemaining(timeRemaining)}
                          </span>
                        </div>
                      )}
                  </div>
                  {exam.description && (
                    <p className="text-gray-600 mb-6">{exam.description}</p>
                  )}
                  {error && (
                    <div className="text-red-500 p-2 bg-red-100 rounded mb-4">
                      {error}
                    </div>
                  )}
                  {submissionResult && !examStarted ? (
                    <div className="bg-gray-100 p-6 rounded-lg">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Exam Results
                      </h2>
                      <div className="mb-4">
                        <p className="text-gray-600 mb-2 flex items-center">
                          Overall Status:{" "}
                          {submissionResult.status === "passed" ? (
                            <span className="flex items-center text-green-600 ml-2">
                              <CheckCircle className="h-5 w-5 mr-1" />
                              Passed
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600 ml-2">
                              <XCircle className="h-5 w-5 mr-1" />
                              Failed
                            </span>
                          )}
                        </p>
                        <p className="text-gray-600 mb-2">
                          Latest Score: {submissionResult.score} /{" "}
                          {submissionResult.totalPoints}
                        </p>
                        <p className="text-gray-600 mb-4">
                          Total Attempts: {sortedAttempts.length}
                        </p>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-700">
                          Attempt History
                        </h3>
                        {sortedAttempts.map((attempt, index) => (
                          <div
                            key={attempt._id || index}
                            className="border-b py-4 mb-2 flex justify-between items-center"
                          >
                            <div>
                              <p className="text-gray-600">
                                Attempt {sortedAttempts.length - index} - Score:{" "}
                                {attempt.score} / {submissionResult.totalPoints}
                              </p>
                              <p className="text-sm text-gray-500">
                                Completed: {formatDate(attempt.completedAt)}
                              </p>
                            </div>
                            <p
                              className={`flex items-center ${
                                attempt.passed
                                  ? "text-green-600"
                                  : "text-red-600"
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
                            className="flex items-center bg-yellow-600 text-white hover:bg-yellow-700 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                            onClick={handleTryAgain}
                          >
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Try Again
                          </button>
                        )}
                        <button
                          className="bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                          onClick={() => navigate(`/student/learn/${courseId}`)}
                        >
                          Back to Course
                        </button>
                      </div>
                    </div>
                  ) : timeRemaining === 0 && !submissionResult ? (
                    <div className="text-center text-red-700 p-4 bg-red-50 rounded">
                      <p>This exam has expired. It has been auto-submitted.</p>
                      <button
                        className="mt-4 bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                        onClick={() => navigate(`/student/learn/${courseId}`)}
                      >
                        Back to Course
                      </button>
                    </div>
                  ) : !examStarted ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        This exam has {exam.questions?.length ?? 0} questions
                        and a duration of {exam.duration} minutes.
                      </p>
                      <button
                        className="bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                        onClick={() => {
                          console.log(
                            "[ExamConduct] Start Exam button clicked"
                          );
                          handleStartExam();
                        }}
                        disabled={!isConnected}
                      >
                        Start Exam
                      </button>
                      {!isConnected && (
                        <p className="text-red-500 mt-2">
                          Socket not connected. Please try again.
                        </p>
                      )}
                    </div>
                  ) : exam.questions && exam.questions.length > 0 ? (
                    <>
                      <div className="space-y-6">
                        {exam.questions.map((question, index) => (
                          <div key={question.id} className="border-b pb-4">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                              Question {index + 1}:{" "}
                              {question.questionText || "No question text"}
                            </h3>
                            <div className="space-y-2">
                              {question.options &&
                              question.options.length > 0 ? (
                                question.options.map((option, optIndex) => (
                                  <label
                                    key={option.id || `opt-${optIndex}`}
                                    className="flex items-center space-x-2 cursor-pointer"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      checked={
                                        answers.find(
                                          (a) => a.questionId === question.id
                                        )?.selectedAnswerIndex === optIndex
                                      }
                                      onChange={() =>
                                        handleOptionSelect(
                                          question.id,
                                          optIndex
                                        )
                                      }
                                      className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD]"
                                      disabled={
                                        isSubmitting || timeRemaining === 0
                                      }
                                    />
                                    <span className="text-gray-600">
                                      {option.text || "No option text"}
                                    </span>
                                  </label>
                                ))
                              ) : (
                                <p className="text-red-500 text-sm">
                                  No options available for this question.
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button
                          className="bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                          onClick={handleSubmit}
                          disabled={isSubmitting || timeRemaining === 0}
                        >
                          {isSubmitting ? "Submitting..." : "Submit Exam"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-red-700 p-4 bg-red-50 rounded">
                      <p>
                        No questions found for this exam. Please contact support
                        or try again later.
                      </p>
                      <button
                        className="mt-4 bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                        onClick={() => navigate(`/student/learn/${courseId}`)}
                      >
                        Back to Course
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-red-700">
                  {error || "Failed to load exam."}
                </div>
              )}
            </div>
          </main>
        </div>
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmSubmit}
          message="Are you sure you want to submit your exam? This action cannot be undone."
        />
      </div>
    </ErrorBoundary>
  );
};

export default ExamConduct;
