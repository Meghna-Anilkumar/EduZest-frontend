import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { streamVideoAction } from "../../../redux/actions/courseActions";
import { AppDispatch } from "../../../redux/store";
import LessonForm from "./EditLesson";
import ModuleForm from "./EditModule";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface Lesson {
  _id?: string;
  lessonNumber: string;
  title: string;
  description: string;
  objectives?: string[];
  video: string;
  videoKey?: string;
  duration?: string;
  content?: string;
  resources?: string[];
}

interface Module {
  _id?: string;
  moduleTitle: string;
  lessons: Lesson[];
}

interface ModuleViewModalProps {
  module: Module;
  onClose: () => void;
  onSaveLesson?: (updatedLesson: Lesson, videoFile?: File) => void;
  onSaveModule?: (
    updatedModule: Module,
    originalModuleTitle?: string,
    videoFile?: File,
    lessonIndex?: number
  ) => void;
  onRemoveModule?: (moduleTitle: string) => void;
  isAddingNewModule?: boolean;
  courseId: string;
}

const ModuleViewModal: React.FC<ModuleViewModalProps> = ({
  module,
  onClose,
  onSaveLesson,
  onSaveModule,
  onRemoveModule,
  isAddingNewModule = false,
  courseId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(isAddingNewModule);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isAddingNewModule) setIsAddingModule(true);
  }, [isAddingNewModule]);

  useEffect(() => {
    if (videoUrl) {
      window.URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setVideoError(null);
    setVideoLoading(true);

    if (selectedLesson?.videoKey && courseId) {
      setIsLoading(true);
      dispatch(
        streamVideoAction({ courseId, videoKey: selectedLesson.videoKey })
      )
        .unwrap()
        .then((result: { videoUrl: string; videoKey: string }) => {
          setVideoUrl(result.videoUrl);
          setVideoLoading(false);
          setIsLoading(false);
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === "object" && error && "message" in error
              ? String(error.message)
              : "Failed to load video. Please try again.";
          setVideoError(errorMessage);
          setVideoLoading(false);
          setIsLoading(false);
        });
    } else {
      setVideoLoading(false);
    }

    return () => {
      if (videoUrl) {
        window.URL.revokeObjectURL(videoUrl);
      }
    };
  }, [selectedLesson, courseId, dispatch]);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  }, [videoUrl]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsEditingLesson(false);
    setIsAddingLesson(false);
    setIsAddingModule(false);
    setVideoError(null);
    setVideoUrl(null);
  };

  const handleConfirmEditLesson = () => {
    setConfirmMessage("Are you sure you want to edit this lesson?");
    setConfirmAction(() => () => {
      setIsEditingLesson(true);
      setIsAddingLesson(false);
      setIsAddingModule(false);
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handleEditModule = () => {
    setIsEditingModule(true);
    setIsAddingModule(false);
  };

  const handleConfirmRemoveLesson = (lessonId?: string) => {
    setConfirmMessage("Are you sure you want to remove this lesson?");
    setConfirmAction(() => () => {
      if (onSaveModule && lessonId) {
        const filteredLessons = module.lessons.filter(
          (lesson) => lesson._id !== lessonId
        );
        const updatedLessons = filteredLessons.map((lesson, index) => ({
          ...lesson,
          lessonNumber: (index + 1).toString(),
        }));
        const updatedModule = { ...module, lessons: updatedLessons };
        onSaveModule(updatedModule);
        setSelectedLesson(null);
      }
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handleConfirmRemoveModule = () => {
    setConfirmMessage("Are you sure you want to remove this module?");
    setConfirmAction(() => () => {
      if (onRemoveModule) {
        onRemoveModule(module.moduleTitle);
        onClose();
      }
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handleAddLesson = () => {
    setIsAddingLesson(true);
    setIsEditingLesson(false);
    setIsAddingModule(false);
    setSelectedLesson(null);
  };

  const renderLessonDetails = () => {
    if (!selectedLesson) return null;

    return (
      <div className="mt-6 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Lesson {selectedLesson.lessonNumber}: {selectedLesson.title}
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {!isEditingLesson && (
              <>
                <button
                  onClick={handleConfirmEditLesson}
                  className="px-5 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#3a9a9c] transition-all duration-200 shadow-sm w-full sm:w-auto"
                >
                  Edit Lesson
                </button>
                <button
                  onClick={() => handleConfirmRemoveLesson(selectedLesson._id)}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm w-full sm:w-auto"
                >
                  Remove Lesson
                </button>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-sm w-full sm:w-auto"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>

        {isEditingLesson && selectedLesson && (
          <LessonForm
            lesson={selectedLesson}
            onSave={(updatedLesson, videoFile) => {
              if (onSaveLesson) {
                setIsLoading(true);
                onSaveLesson(updatedLesson, videoFile);
                setSelectedLesson(updatedLesson);
                setIsEditingLesson(false);
                setIsLoading(false);
              }
            }}
            onCancel={() => setIsEditingLesson(false)}
            isEditing={true}
            courseId={courseId}
          />
        )}

        {!isEditingLesson && (
          <div className="space-y-8">
            {selectedLesson.videoKey ? (
              <div className="relative pt-[56.25%] bg-gray-900 rounded-xl overflow-hidden shadow-md">
                {videoLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <p className="text-white textreally text-gray-300 animate-pulse">
                      Loading video...
                    </p>
                  </div>
                ) : videoError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <p className="text-red-400">Error: {videoError}</p>
                  </div>
                ) : videoUrl ? (
                  <video
                    ref={videoRef}
                    controls
                    controlsList="nodownload"
                    className="absolute inset-0 w-full h-full object-contain"
                    key={selectedLesson.videoKey}
                    onError={() =>
                      setVideoError("Failed to play video. Please try again.")
                    }
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <p className="text-gray-300">
                      No video URL available for {selectedLesson.videoKey}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <p className="text-gray-600 font-medium">
                  No video provided for this lesson
                </p>
              </div>
            )}
            {videoError && (
              <p className="text-red-500 text-sm mt-2">{videoError}</p>
            )}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                Lesson Overview
              </h4>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Duration:{" "}
                  {selectedLesson.duration
                    ? `${selectedLesson.duration} hours`
                    : "N/A"}
                </span>
                <span>Lesson Number: {selectedLesson.lessonNumber}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                Description
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {selectedLesson.description}
              </p>
            </div>
            {selectedLesson.resources && selectedLesson.resources.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Additional Resources
                </h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {selectedLesson.resources.map((resource, index) => (
                    <li key={index}>{resource}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedLesson.objectives && selectedLesson.objectives.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Objectives
                </h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {selectedLesson.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#49BBBD]"></div>
            <p className="text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60 overflow-y-auto p-4">
        <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl p-8 overflow-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 mb-8 gap-4">
            {isEditingModule ? (
              <ModuleForm
                module={module}
                onSave={(updatedModule, originalModuleTitle) => {
                  if (onSaveModule) {
                    setIsLoading(true);
                    onSaveModule(updatedModule, originalModuleTitle);
                    setIsEditingModule(false);
                    setIsLoading(false);
                  }
                }}
                onClose={() => setIsEditingModule(false)}
                isEditing={true}
              />
            ) : (
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {isAddingModule ? "New Module" : module.moduleTitle}
              </h2>
            )}
            {!isEditingModule && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {!isAddingModule && (
                  <>
                    <button
                      onClick={handleEditModule}
                      className="px-5 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#3a9a9c] transition-all duration-200 shadow-sm w-full sm:w-auto"
                    >
                      Edit Module
                    </button>
                    <button
                      onClick={handleConfirmRemoveModule}
                      className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm w-full sm:w-auto"
                    >
                      Remove Module
                    </button>
                    <button
                      onClick={handleAddLesson}
                      className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-sm w-full sm:w-auto"
                    >
                      Add Lesson
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-sm"
                  aria-label="Close modal"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 bg-gray-50 rounded-xl p-6 max-h-[70vh] overflow-y-auto shadow-sm">
              <h3 className="text-xl font-semibold mb-5 text-gray-900 tracking-tight">
                Lessons
              </h3>
              {isAddingModule ? (
                <div className="text-center text-gray-500 py-6">
                  No lessons yet. Save the module to add lessons.
                </div>
              ) : module.lessons.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  No lessons available. Add a lesson to get started.
                </div>
              ) : (
                <>
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson._id || lesson.lessonNumber}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`border-b border-gray-100 last:border-b-0 py-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer rounded-lg px-3 ${
                        selectedLesson?._id === lesson._id
                          ? "bg-[#49BBBD] bg-opacity-10 border-l-4 border-[#49BBBD]"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500 font-medium">
                              Lesson {lesson.lessonNumber}
                            </span>
                            <span className="text-[#49BBBD] bg-[#49BBBD] bg-opacity-10 px-2.5 py-1 rounded-full text-xs font-medium">
                              {lesson.duration ? `${lesson.duration} hrs` : "N/A"}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mt-2 text-base">
                            {lesson.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              {isAddingModule ? (
                <ModuleForm
                  module={{ moduleTitle: "", lessons: [] }}
                  onSave={(newModule, _) => {
                    if (onSaveModule) {
                      setIsLoading(true);
                      onSaveModule(newModule);
                      setIsAddingModule(false);
                      onClose();
                      setIsLoading(false);
                    }
                  }}
                  onClose={() => {
                    setIsAddingModule(false);
                    onClose();
                  }}
                  isEditing={false}
                />
              ) : isAddingLesson ? (
                <LessonForm
                  lesson={{
                    lessonNumber: (module.lessons.length + 1).toString(),
                    title: "",
                    description: "",
                    video: "",
                  }}
                  onSave={(newLesson, videoFile) => {
                    if (onSaveModule) {
                      setIsLoading(true);
                      const updatedModule = {
                        ...module,
                        lessons: [...module.lessons, newLesson],
                      };
                      onSaveModule(
                        updatedModule,
                        undefined,
                        videoFile,
                        module.lessons.length
                      );
                      setIsAddingLesson(false);
                      setIsLoading(false);
                    }
                  }}
                  onCancel={() => setIsAddingLesson(false)}
                  isEditing={false}
                  courseId={courseId}
                />
              ) : selectedLesson ? (
                renderLessonDetails()
              ) : (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
                  <p className="font-medium">
                    Select a lesson to view its details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        message={confirmMessage}
      />
    </>
  );
};

export default ModuleViewModal;