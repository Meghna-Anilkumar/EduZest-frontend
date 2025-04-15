import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  getCourseByIdAction,
  streamVideoAction,
} from "../../redux/actions/courseActions";
import { clearError } from "../../redux/reducers/courseReducer";
import { checkEnrollmentAction } from "../../redux/actions/enrollmentActions";
import Header from "../common/users/Header";
import StudentSidebar from "./StudentSidebar";
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Clock,
  BookOpen,
  User,
  Shield,
} from "lucide-react";
import RatingReview from "./ReviewComponent";

interface ILesson {
  lessonNumber: string;
  title: string;
  description: string;
  videoKey: string;
  duration?: string;
  objectives?: string[];
}

interface IModule {
  moduleTitle: string;
  lessons: ILesson[];
}

interface ICourse {
  _id: string;
  title: string;
  description: string;
  instructorRef: {
    _id: string;
    name: string;
    profile?: { profilePic?: string };
  };
  thumbnail: string;
  thumbnailKey?: string;
  modules: IModule[];
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  trial?: { videoKey?: string };
  pricing: { type: "free" | "paid"; amount: number };
  studentsEnrolled: number;
  isPublished: boolean;
}

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { userData } = useSelector((state: RootState) => state.user);
  const [course, setCourse] = useState<ICourse | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Course Content");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      if (!courseId) return;

      try {
        const result = await dispatch(getCourseByIdAction(courseId)).unwrap();
        console.log("Fetched Course Data:", result);
        const enrichedResult = {
          ...result,
          modules: result.modules
            ? result.modules.map((module: IModule) => ({
                ...module,
                lessons: module.lessons.map((lesson: ILesson) => ({
                  ...lesson,
                  objectives: lesson.objectives || [
                    "Understand key concepts",
                    "Apply practical skills",
                    "Analyze case studies",
                  ],
                })),
              }))
            : [],
        };
        setCourse(enrichedResult);

        if (userData) {
          const response = await dispatch(checkEnrollmentAction(courseId)).unwrap();
          setIsEnrolled(response.data.isEnrolled);
        }

        if (
          enrichedResult.modules &&
          enrichedResult.modules.length > 0 &&
          enrichedResult.modules[0].lessons.length > 0
        ) {
          setSelectedLesson(enrichedResult.modules[0].lessons[0]);
          setExpandedSections([enrichedResult.modules[0].moduleTitle]);
        }
      } catch (err: any) {
        console.error("Failed to fetch course details:", err.message);
      }
    };

    fetchCourseAndEnrollment();
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, courseId, userData]);

  useEffect(() => {
    const fetchVideoStream = async () => {
      if (selectedLesson && selectedLesson.videoKey) {
        setIsLoading(true);
        setVideoUrl(null); // Reset video URL to force new stream
        try {
          const result = await dispatch(
            streamVideoAction({ courseId: courseId!, videoKey: selectedLesson.videoKey })
          ).unwrap();
          setVideoUrl(result.videoUrl);
          console.log("Video URL set:", result.videoUrl);
          if (videoRef.current) {
            videoRef.current.load(); // Force reload to apply new src
          }
        } catch (err: any) {
          console.error("Failed to stream video:", err.message);
          setVideoError("Failed to load video. Please try refreshing or contact support.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchVideoStream();

    return () => {
      if (videoUrl) {
        window.URL.revokeObjectURL(videoUrl);
      }
    };
  }, [dispatch, selectedLesson, courseId]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const toggleSection = (moduleTitle: string) =>
    setExpandedSections((prev) =>
      prev.includes(moduleTitle)
        ? prev.filter((title) => title !== moduleTitle)
        : [...prev, moduleTitle]
    );

  const handleLessonClick = (lesson: ILesson) => {
    setSelectedLesson(lesson);
    setVideoError(null);
  };

  const handleExpandAll = () => {
    if (expandAll) setExpandedSections([]);
    else setExpandedSections(course?.modules.map((m) => m.moduleTitle) || []);
    setExpandAll(!expandAll);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalDuration = () => {
    if (!course) return "0h 0m";
    let totalMinutes = 0;
    course.modules.forEach((module) =>
      module.lessons.forEach(
        (lesson) => (totalMinutes += lesson.duration ? parseFloat(lesson.duration) : 0)
      )
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const formatLessonDuration = (duration?: string) =>
    !duration ? "00:00" : `${parseInt(duration, 10)}m`;

  const totalLessons = course?.modules.reduce((acc, module) => acc + module.lessons.length, 0) || 0;

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
          <div className="max-w-6xl mx-auto">
            {course && course.modules && course.modules.length > 0 ? (
              <>
                <div
                  className="text-white p-6 rounded-lg mb-6 shadow-lg"
                  style={{ background: "linear-gradient(to right, #49bbbd, #276b6b)" }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div className="md:w-3/4">
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
                      <p className="text-gray-300 mb-4">{course.description}</p>
                      <div className="flex items-center mb-4">
                        {course.instructorRef.profile?.profilePic ? (
                          <img
                            src={course.instructorRef.profile.profilePic}
                            alt={course.instructorRef.name}
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                            <User className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            Instructor:{" "}
                            <Link to={`/instructor/${course.instructorRef._id}`} className="underline">
                              {course.instructorRef.name}
                            </Link>
                          </p>
                          <p className="text-xs text-gray-300">
                            {course.pricing.type === "free" ? (
                              <span className="text-green-400 font-semibold">Free</span>
                            ) : (
                              <span className="text-yellow-400 font-semibold">₹{course.pricing.amount}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                          {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                        </span>
                        <span className="flex items-center text-xs">
                          <Clock className="h-4 w-4 mr-1" />
                          {getTotalDuration()}
                        </span>
                        <span className="flex items-center text-xs">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {totalLessons} lessons
                        </span>
                        <span className="flex items-center text-xs">
                          <User className="h-4 w-4 mr-1" />
                          {course.studentsEnrolled.toLocaleString()} students
                        </span>
                        <span className="flex items-center text-xs">
                          <Shield className="h-4 w-4 mr-1" />
                          {course.language}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/3 order-2 lg:order-1">
                    <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Course Content</h2>
                        <button
                          className="text-[#49BBBD] text-sm font-medium hover:underline"
                          onClick={handleExpandAll}
                        >
                          {expandAll ? "Collapse all" : "Expand all"}
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {course.modules.length} modules • {totalLessons} lessons • {getTotalDuration()} total
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto pr-1">
                        {course.modules.map((module: IModule, index: number) => (
                          <div key={index} className="border-t border-gray-200 py-2">
                            <button
                              className="flex justify-between items-center w-full text-left p-2 hover:bg-gray-50 rounded-md"
                              onClick={() => toggleSection(module.moduleTitle)}
                            >
                              <span className="font-semibold text-gray-800">{module.moduleTitle}</span>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-2">{module.lessons.length} lessons</span>
                                {expandedSections.includes(module.moduleTitle) ? (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </button>
                            {expandedSections.includes(module.moduleTitle) && (
                              <ul className="mt-2 pl-2">
                                {module.lessons.map((lesson: ILesson) => (
                                  <li
                                    key={lesson.lessonNumber}
                                    className={`flex items-center justify-between p-2 cursor-pointer rounded-md transition-colors duration-200 ${
                                      selectedLesson && selectedLesson.lessonNumber === lesson.lessonNumber
                                        ? "bg-blue-50 text-[#49BBBD]"
                                        : "hover:bg-gray-50"
                                    }`}
                                    onClick={() => handleLessonClick(lesson)}
                                  >
                                    <div className="flex items-center">
                                      <PlayCircle
                                        className={`h-4 w-4 mr-2 ${
                                          selectedLesson && selectedLesson.lessonNumber === lesson.lessonNumber
                                            ? "text-[#49BBBD]"
                                            : "text-gray-500"
                                        }`}
                                      />
                                      <span className="text-sm truncate max-w-xs">{lesson.title}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatLessonDuration(lesson.duration)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-2/3 order-1 lg:order-2">
                    {selectedLesson ? (
                      <div className="bg-white rounded-lg overflow-hidden shadow-md">
                        <div className="relative pt-[56.25%]">
                          {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                              <p className="text-gray-600">Loading video...</p>
                            </div>
                          ) : videoUrl ? (
                            <video
                              ref={videoRef}
                              controls
                              className="absolute inset-0 w-full h-full"
                              src={videoUrl}
                              poster={course.thumbnail}
                              onError={(e) => {
                                console.error("Video Error:", e.target.error);
                                setVideoError("Failed to play video. Please try refreshing or contact support.");
                              }}
                              onLoadStart={() => console.log("Video load started:", videoUrl)}
                              onCanPlay={() => console.log("Video ready to play:", videoUrl)}
                              onPlaying={() => console.log("Video playing:", videoUrl)}
                              onPause={() => console.log("Video paused:", videoUrl)}
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                              <img
                                src={course.thumbnail}
                                alt={`${course.title} thumbnail`}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                        </div>
                        {videoError && <p className="text-red-500 text-sm p-4">{videoError}</p>}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedLesson.title}</h3>
                          <div className="flex items-center text-sm text-gray-600 mb-4">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatLessonDuration(selectedLesson.duration)}</span>
                          </div>
                          {selectedLesson.description && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                              <p className="text-gray-600">{selectedLesson.description}</p>
                            </div>
                          )}
                          {selectedLesson.objectives && selectedLesson.objectives.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Learning Objectives</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {selectedLesson.objectives.map((objective, index) => (
                                  <li key={index} className="text-gray-600">{objective}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-6 text-center shadow-md h-64 flex flex-col items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">Select a lesson to start learning</p>
                        <button
                          className="bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                          onClick={() => {
                            if (course?.modules[0]?.lessons[0]) {
                              handleLessonClick(course.modules[0].lessons[0]);
                            }
                          }}
                        >
                          Start First Lesson
                        </button>
                      </div>
                    )}
                    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                      <RatingReview courseId={course._id} rating={4.5} reviewCount={120} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">Course not found.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseDetails;