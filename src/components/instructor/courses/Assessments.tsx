import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../InstructorSidebar";
import InstructorNavbar from "../InstructorNavbar";
import { IAssessment } from "../../../interface/IAssessment";
import {
  createAssessmentAction,
  getAssessmentsByCourseAndModuleAction,
  editAssessmentAction,
  deleteAssessmentAction,
} from "../../../redux/actions/assessmentActions";
import { AppDispatch } from "../../../redux/store";
import AssessmentForm from "./AssessmentForm";
import Pagination from "../../common/Pagination";
import ConfirmationModal from "../../common/ConfirmationModal";

const AssessmentsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assessments, setAssessments] = useState<IAssessment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] =
    useState<IAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);
  const navigate = useNavigate();
  const { courseId, moduleTitle } = useParams<{
    courseId: string;
    moduleTitle: string;
  }>();
  const dispatch = useDispatch<AppDispatch>();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<() => Promise<void>>(
    () => async () => {}
  );

  useEffect(() => {
    if (courseId && moduleTitle) {
      setLoading(true);
      const decodedModuleTitle = decodeURIComponent(moduleTitle);
      console.log(
        `Fetching assessments for courseId: ${courseId}, moduleTitle: ${decodedModuleTitle}, page: ${currentPage}, limit: ${limit}`
      );
      dispatch(
        getAssessmentsByCourseAndModuleAction({
          courseId,
          moduleTitle: decodedModuleTitle,
          page: currentPage,
          limit,
        })
      )
        .then((result) => {
          if (getAssessmentsByCourseAndModuleAction.fulfilled.match(result)) {
            console.log("Fetch success:", {
              assessments: result.payload.assessments.length,
              total: result.payload.total,
              totalPages: result.payload.totalPages,
              page: result.payload.page,
              limit: result.payload.limit,
            });
            setAssessments(result.payload.assessments);
            setTotalPages(result.payload.totalPages || 1);
          } else if (
            getAssessmentsByCourseAndModuleAction.rejected.match(result)
          ) {
            const errorMessage =
              result.payload?.message || "Failed to fetch assessments";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Fetch error:", {
              message: errorMessage,
              payload: result.payload,
            });
          }
        })
        .catch((err) => {
          const errorMessage = err.message || "Failed to fetch assessments";
          setError(errorMessage);
          toast.error(errorMessage);
          console.error("Unexpected fetch error:", {
            error: err,
            message: errorMessage,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [courseId, moduleTitle, currentPage, limit, dispatch]);

  const handleSaveAssessment = async (assessment: IAssessment) => {
    if (!courseId || !moduleTitle) {
      setError("Course ID or module title is missing");
      toast.error("Course ID or module title is missing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingAssessment) {
        // Handle editing an existing assessment
        const updateData: Partial<IAssessment> = {
          title: assessment.title,
          description: assessment.description,
          questions: assessment.questions,
        };

        const result = await dispatch(
          editAssessmentAction({
            assessmentId: editingAssessment._id,
            updateData,
          })
        ).unwrap();

        // Update local state with the updated assessment
        setAssessments(
          assessments.map((a) =>
            a._id === result._id
              ? { ...result, updatedAt: new Date().toISOString() }
              : a
          )
        );
        toast.success("Assessment updated successfully");
      } else {
        // Handle creating a new assessment
        const assessmentData: Partial<IAssessment> = {
          courseId,
          moduleTitle: decodeURIComponent(moduleTitle),
          title: assessment.title,
          description: assessment.description,
          questions: assessment.questions,
        };

        const result = await dispatch(
          createAssessmentAction({
            courseId,
            moduleTitle: decodeURIComponent(moduleTitle),
            assessmentData,
          })
        ).unwrap();

        setAssessments([...assessments, result]);
        toast.success("Assessment created successfully");
      }

      setIsFormOpen(false);
      setEditingAssessment(null);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to save assessment";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Failed to save assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAssessment = (assessment: IAssessment) => {
    setEditingAssessment(assessment);
    setIsFormOpen(true);
  };

  const confirmDeleteAssessment = (id: string) => {
    setModalMessage("Are you sure you want to delete this assessment?");
    setPendingAction(() => async () => {
      setLoading(true);
      setError(null);

      try {
        await dispatch(deleteAssessmentAction({ assessmentId: id })).unwrap();

        setAssessments(assessments.filter((a) => a._id !== id));
        toast.success("Assessment deleted successfully");
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to delete assessment";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Failed to delete assessment:", err);
      } finally {
        setLoading(false);
      }
    });
    setIsModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setIsModalOpen(false);
    await pendingAction();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        open={sidebarOpen}
        currentPage="courses"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        setCurrentPage={() => {}}
      />
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <button
                  onClick={() =>
                    navigate(`/instructor/courseDetails/${courseId}`)
                  }
                  className="text-gray-600 hover:text-gray-800 mr-4"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Assessments for {decodeURIComponent(moduleTitle || "")}
                </h1>
              </div>
              <InstructorNavbar loading={false} error={null} />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Assessments</h3>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-[#49BBBD] text-white px-4 py-2 rounded-md hover:bg-[#3a9a9c]"
              >
                Create Assessment
              </button>
            </div>
            {loading && (
              <div className="text-center text-gray-500 py-4">Loading...</div>
            )}
            {error && (
              <div className="text-center text-red-500 py-4">{error}</div>
            )}
            {assessments.length === 0 && !loading ? (
              <div className="text-center text-gray-500 py-4">
                No assessments available. Create an assessment to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment._id}
                    className="border p-4 rounded-md flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {assessment.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {assessment.description}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {assessment.questions.length} Questions
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAssessment(assessment)}
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        title="Edit Assessment"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
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
                      </button>
                      <button
                        onClick={() => confirmDeleteAssessment(assessment._id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                        title="Delete Assessment"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages >= 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </main>
        {isFormOpen && (
          <AssessmentForm
            assessment={editingAssessment}
            onSave={handleSaveAssessment}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingAssessment(null);
            }}
          />
        )}
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
          message={modalMessage}
        />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default AssessmentsPage;
