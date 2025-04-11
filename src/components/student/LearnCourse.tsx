import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getCourseByIdAction } from "../../redux/actions/courseActions";
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
import { ICourse, ILesson, IModule } from "../../interface/ICourse";
import RatingReview from "./ReviewComponent";

interface Lesson extends ILesson {
  lessonNumber: string;
  title: string;
  description: string;
  video: string;
  duration?: string;
  objectives?: string[];
}

interface Module extends IModule {
  moduleTitle: string;
  lessons: Lesson[];
}

interface CourseData extends ICourse {
  _id: string;
  title: string;
  description: string;
  instructorRef: {
    _id: string;
    name: string;
    profile?: { profilePic?: string };
  };
  thumbnail: string;
  modules: Module[];
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  trial?: { video?: string };
  pricing: { type: "free" | "paid"; amount: number };
  studentsEnrolled: number;
}

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Course Content");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      setLoading(true);
      setError(null);
      try {
        const result = await dispatch(getCourseByIdAction(courseId)).unwrap();
        const enrichedResult = {
          ...result,
          modules: result.modules.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) => ({
              ...lesson,
              objectives: lesson.objectives || [
                "Understand key economic concepts",
                "Learn RBI policies",
                "Analyze UPI and Bitcoin",
              ],
            })),
          })),
        };
        setCourse(enrichedResult);

        // Auto-select first lesson
        if (
          enrichedResult.modules.length > 0 &&
          enrichedResult.modules[0].lessons.length > 0
        ) {
          setSelectedLesson(enrichedResult.modules[0].lessons[0]);
          setExpandedSections([enrichedResult.modules[0].moduleTitle]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [dispatch, courseId]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSection = (moduleTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(moduleTitle)
        ? prev.filter((title) => title !== moduleTitle)
        : [...prev, moduleTitle]
    );
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedSections([]);
    } else {
      setExpandedSections(course?.modules.map((m) => m.moduleTitle) || []);
    }
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

  // Calculate total course duration
  const getTotalDuration = () => {
    if (!course) return "0h 0m";

    let totalMinutes = 0;
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        if (lesson.duration) {
          const [min, sec] = lesson.duration.split(":").map(Number);
          totalMinutes += min + sec / 60;
        }
      });
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const totalLessons =
    course?.modules.reduce((acc, module) => acc + module.lessons.length, 0) ||
    0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <div className="hidden md:block fixed top-[80px] left-0 h-[calc(100vh-80px)] w-64 z-30 overflow-y-auto bg-white shadow-md">
          <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Mobile menu button */}
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

        {/* Mobile sidebar */}
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

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pt-24 md:ml-64 mt-16">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49BBBD]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center mb-4">
                <span>{error}</span>
              </div>
            ) : course ? (
              <>
                {/* Course Header */}
                <div
                  className="text-white p-6 rounded-lg mb-6 shadow-lg"
                  style={{
                    background: "linear-gradient(to right, #49bbbd, #276b6b)",
                  }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div className="md:w-3/4">
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        {course.title}
                      </h1>
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
                            <Link
                              to={`/instructor/${course.instructorRef._id}`}
                              className="underline"
                            >
                              {course.instructorRef.name}
                            </Link>
                          </p>
                          <p className="text-xs text-gray-300">
                            {course.pricing.type === "free" ? (
                              <span className="text-green-400 font-semibold">
                                Free
                              </span>
                            ) : (
                              <span className="text-yellow-400 font-semibold">
                                ₹{course.pricing.amount}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(
                            course.level
                          )}`}
                        >
                          {course.level.charAt(0).toUpperCase() +
                            course.level.slice(1)}
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

                {/* Video Player and Course Content */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side - Course Content */}
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
                        {course.modules.length} modules • {totalLessons} lessons
                        • {getTotalDuration()} total
                      </div>

                      <div className="max-h-[60vh] overflow-y-auto pr-1">
                        {course.modules.map((module: Module, index: number) => (
                          <div
                            key={index}
                            className="border-t border-gray-200 py-2"
                          >
                            <button
                              className="flex justify-between items-center w-full text-left p-2 hover:bg-gray-50 rounded-md"
                              onClick={() => toggleSection(module.moduleTitle)}
                            >
                              <span className="font-semibold text-gray-800">
                                {module.moduleTitle}
                              </span>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-2">
                                  {module.lessons.length} lessons
                                </span>
                                {expandedSections.includes(
                                  module.moduleTitle
                                ) ? (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </button>
                            {expandedSections.includes(module.moduleTitle) && (
                              <ul className="mt-2 pl-2">
                                {module.lessons.map((lesson: Lesson) => (
                                  <li
                                    key={lesson.lessonNumber}
                                    className={`flex items-center justify-between p-2 cursor-pointer rounded-md transition-colors duration-200 ${
                                      selectedLesson &&
                                      selectedLesson.lessonNumber ===
                                        lesson.lessonNumber
                                        ? "bg-blue-50 text-[#49BBBD]"
                                        : "hover:bg-gray-50"
                                    }`}
                                    onClick={() => handleLessonClick(lesson)}
                                  >
                                    <div className="flex items-center">
                                      <PlayCircle
                                        className={`h-4 w-4 mr-2 ${
                                          selectedLesson &&
                                          selectedLesson.lessonNumber ===
                                            lesson.lessonNumber
                                            ? "text-[#49BBBD]"
                                            : "text-gray-500"
                                        }`}
                                      />
                                      <span className="text-sm truncate max-w-xs">
                                        {lesson.title}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {lesson.duration || "00:00"}
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

                  {/* Right Side - Video Player */}
                  <div className="lg:w-2/3 order-1 lg:order-2">
                    {selectedLesson ? (
                      <div className="bg-white rounded-lg overflow-hidden shadow-md">
                        <div className="relative pt-[56.25%]">
                          <video
                            controls
                            className="absolute inset-0 w-full h-full"
                            src={selectedLesson.video}
                            poster={course.thumbnail}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {selectedLesson.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mb-4">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{selectedLesson.duration || "00:00"}</span>
                          </div>
                          {selectedLesson.description && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-700 mb-1">
                                Description
                              </h4>
                              <p className="text-gray-600">
                                {selectedLesson.description}
                              </p>
                            </div>
                          )}
                          {selectedLesson.objectives &&
                            selectedLesson.objectives.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-700 mb-1">
                                  Learning Objectives
                                </h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {selectedLesson.objectives.map(
                                    (objective, index) => (
                                      <li key={index} className="text-gray-600">
                                        {objective}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-6 text-center shadow-md h-64 flex flex-col items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">
                          Select a lesson to start learning
                        </p>
                        <button className="bg-[#49BBBD] hover:bg-[#3aa9ab] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                          Start First Lesson
                        </button>
                      </div>
                    )}

                    {/* Rating and Review Section */}
                    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                      <RatingReview
                        courseId={course._id}
                        rating={4.5}
                        reviewCount={120}
                      />
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
