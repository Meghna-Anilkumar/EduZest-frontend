// CourseDetails.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getCourseByIdAction } from "../../redux/actions/courseActions";
import Header from "../common/users/Header";
import StudentSidebar from "./StudentSidebar";
import { ChevronDown, ChevronRight, PlayCircle } from "lucide-react";
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
  instructorRef: { _id: string; name: string; profile?: { profilePic?: string } };
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
              objectives: lesson.objectives || ["Understand key economic concepts", "Learn RBI policies", "Analyze UPI and Bitcoin"],
            })),
          })),
        };
        setCourse(enrichedResult);
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMobileMenu}>
            <div className="absolute top-0 left-0 h-full w-64 bg-white z-50" onClick={(e) => e.stopPropagation()}>
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
                <div className="bg-gray-900 text-white p-6 mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
                  <p className="text-gray-300 mb-4">{course.description}</p>
                  <p className="text-sm">
                    Created by{" "}
                    <Link to={`/instructor/${course.instructorRef._id}`} className="underline">
                      {course.instructorRef.name}
                    </Link>
                  </p>
                  <p className="text-sm">
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)} •{" "}
                    {course.language} • {course.studentsEnrolled.toLocaleString()} students
                  </p>
                </div>

                {/* Video Player and Course Content */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Video Player with Objectives and Description */}
                  <div className="lg:w-2/3">
                    {selectedLesson ? (
                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <video
                          controls
                          className="w-full h-auto"
                          src={selectedLesson.video}
                          poster={course.thumbnail}
                        >
                          Your browser does not support the video tag.
                        </video>
                        <div className="p-4 text-white">
                          <h3 className="text-lg font-semibold">{selectedLesson.title}</h3>
                          {selectedLesson.objectives && selectedLesson.objectives.length > 0 && (
                            <div className="mt-2">
                              <h4 className="font-medium">Objectives:</h4>
                              <ul className="list-disc list-inside mt-1">
                                {selectedLesson.objectives.map((objective, index) => (
                                  <li key={index} className="text-sm">{objective}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {selectedLesson.description && (
                            <p className="mt-2 text-sm">{selectedLesson.description}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-200 rounded-lg p-6 text-center">
                        <p className="text-gray-600">Select a lesson to start watching</p>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="lg:w-1/3">
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <h2 className="text-xl font-bold mb-4">Course Content</h2>
                      <button className="text-blue-600 mb-4">Expand all sections</button>

                      {course.modules.map((module: Module, index: number) => (
                        <div key={index} className="border-t py-2">
                          <button
                            className="flex justify-between items-center w-full text-left"
                            onClick={() => toggleSection(module.moduleTitle)}
                          >
                            <span className="font-semibold">{module.moduleTitle}</span>
                            {expandedSections.includes(module.moduleTitle) ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </button>
                          {expandedSections.includes(module.moduleTitle) && (
                            <ul className="mt-2">
                              {module.lessons.map((lesson: Lesson) => (
                                <li
                                  key={lesson.lessonNumber}
                                  className={`flex items-center justify-between py-1 cursor-pointer ${
                                    selectedLesson && selectedLesson.lessonNumber === lesson.lessonNumber
                                      ? "bg-blue-100 text-blue-800"
                                      : "hover:bg-gray-100"
                                  }`}
                                  onClick={() => handleLessonClick(lesson)}
                                >
                                  <div className="flex items-center">
                                    <PlayCircle className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">{lesson.title}</span>
                                  </div>
                                  <span className="text-sm text-gray-500">
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

                {/* Rating and Review Section */}
                <div className="mt-6">
                <RatingReview courseId={course._id} rating={4.5} reviewCount={120} /> 
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