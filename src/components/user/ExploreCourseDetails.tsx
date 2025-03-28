import React, { useState, useEffect, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Book, Clock, Star, ChevronDown, ChevronUp } from "lucide-react";
import { AppDispatch, RootState } from "../../redux/store";
import { getCourseByIdAction } from "../../redux/actions/courseActions";
import { clearError } from "../../redux/reducers/courseReducer";

const Header = lazy(() => import("../common/users/Header"));

interface Course {
  _id: string;
  title: string;
  description: string;
  instructorRef: { _id: string; name: string; profile: { profilePic: string } };
  categoryRef: { _id: string; categoryName: string };
  language: string;
  level: "beginner" | "intermediate" | "advanced";
  pricing: { type: "free" | "paid"; amount: number };
  thumbnail: string;
  modules: Array<{
    moduleTitle: string;
    lessons: Array<{
      lessonNumber: string;
      title: string;
      description: string;
      objectives?: string[];
      video: string;
      duration?: string;
    }>;
  }>;
  trial: { video?: string };
  attachments?: { title?: string; url?: string };
  isRequested: boolean;
  isBlocked: boolean;
  studentsEnrolled: number;
  isPublished: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
}

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.course);
  const [course, setCourse] = useState<Course | null>(null);
  const [activeSections, setActiveSections] = useState<number[]>([]);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getCourseByIdAction(id)).then((action) => {
        if (getCourseByIdAction.fulfilled.match(action)) {
          setCourse(action.payload); 
        }
      });
    }

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, id]);


  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!course) return <div className="text-center py-10 text-gray-500">Course not found.</div>;

  // Calculate total lessons and duration for display
  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalDuration = course.modules.reduce((acc, module) => {
    const moduleDuration = module.lessons.reduce((lessonAcc, lesson) => {
      if (!lesson.duration) return lessonAcc;
      const [hours, minutes] = lesson.duration.match(/(\d+)hr(\d+)min/)?.slice(1) || ["0", "0"];
      const lessonMinutes = parseInt(hours) * 60 + parseInt(minutes);
      return lessonAcc + lessonMinutes;
    }, 0);
    return acc + moduleDuration;
  }, 0);
  const formattedDuration = `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`;

  // Calculate total sections (modules)
  const totalModules = course.modules.length;

  // Format module duration
  const formatModuleDuration = (lessons: Course["modules"][0]["lessons"]) => {
    const moduleDuration = lessons.reduce((acc, lesson) => {
      if (!lesson.duration) return acc;
      const [hours, minutes] = lesson.duration.match(/(\d+)hr(\d+)min/)?.slice(1) || ["0", "0"];
      const lessonMinutes = parseInt(hours) * 60 + parseInt(minutes);
      return acc + lessonMinutes;
    }, 0);
    return `${Math.floor(moduleDuration / 60)}h ${moduleDuration % 60}min`;
  };

  // Toggle individual section
  const toggleSection = (index: number) => {
    setActiveSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Toggle all sections
  const toggleAllSections = () => {
    if (expandAll) {
      setActiveSections([]); 
    } else {
      setActiveSections(course.modules.map((_, index) => index));
    }
    setExpandAll(!expandAll);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Header */}
      <Suspense fallback={<div>Loading...</div>}>
        <Header className="fixed top-0 left-0 right-0 z-50" />
      </Suspense>

      {/* Main Content */}
      <div className="flex-grow">
        {/* Top Section with Dark Background */}
        <div className="bg-gray-900 text-white pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
            {/* Left Column - Course Details */}
            <div className="flex-1">
              <div className="mb-4">
                {course.isPublished && course.studentsEnrolled > 0 && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    Bestseller
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-4">{course.description}</p>

              <div className="flex items-center mb-4">
                <span className="text-yellow-400 font-bold mr-2">4.7</span> {/* Static rating */}
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < 4.7 ? "fill-yellow-400" : "fill-none"}`}
                    />
                  ))}
                </div>
                <a href="#" className="ml-2 text-gray-400 hover:underline">
                  (430,621 ratings) {/* Static for now */}
                </a>
                <span className="ml-2 text-gray-400">
                  {course.studentsEnrolled.toLocaleString()} students
                </span>
              </div>

              <p className="mb-2">
                Created by{" "}
                <a href="#" className="text-[#49BBBD] hover:text-[#3a9a9c]">
                  {course.instructorRef?.name || "Unknown Instructor"}
                </a>
              </p>
              <div className="flex items-center text-gray-400 mb-4">
                <Clock className="w-4 h-4 mr-2" />
                <span>Last updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                <span className="ml-4 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5h18M3 12h18M3 19h18"
                    />
                  </svg>
                  {course.language}
                </span>
              </div>
            </div>

            {/* Right Column - Preview Video */}
            <div className="lg:w-96">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt="Course Preview"
                  className="w-full rounded-lg shadow-lg"
                />
                <button className="absolute inset-0 flex items-center justify-center">
                  {/* <PlayCircle className="w-16 h-16 text-white opacity-80 hover:opacity-100" /> */}
                </button>
                {/* <span className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                  Preview this course
                </span> */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
          {/* Left Column - Lesson Objectives and Course Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Lesson Objectives</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.modules.flatMap((module) =>
                  module.lessons.flatMap((lesson) =>
                    (lesson.objectives || []).map((obj, index) => (
                      <li key={`${lesson.lessonNumber}-${index}`} className="flex items-start">
                        <Book className="w-5 h-5 mr-2 mt-1 text-[#49BBBD]" />
                        <span>{obj}</span>
                      </li>
                    ))
                  )
                )}
              </ul>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Course Content</h2>
                <button
                  onClick={toggleAllSections}
                  className="text-[#49BBBD] hover:underline text-sm font-medium"
                >
                  {expandAll ? "Collapse all modules" : "Expand all modules"}
                </button>
              </div>
              <div className="text-gray-600 text-sm mb-4">
                {totalModules} sections • {totalLessons} lectures • {formattedDuration} total length
              </div>
              <div className="border rounded-lg">
                {course.modules.map((module, index) => (
                  <div key={index} className="border-b last:border-b-0">
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex justify-between items-center py-4 px-4 text-left hover:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex items-center">
                        {activeSections.includes(index) ? (
                          <ChevronUp className="w-5 h-5 mr --

2 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 mr-2 text-gray-600" />
                        )}
                        <span className="font-medium text-gray-800">{module.moduleTitle}</span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        {module.lessons.length} lectures • {formatModuleDuration(module.lessons)}
                      </div>
                    </button>
                    {activeSections.includes(index) && (
                      <div className="bg-gray-50 px-4 py-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="flex justify-between items-center py-2 border-t first:border-t-0"
                          >
                            <span className="text-gray-700">{lesson.title}</span>
                            <span className="text-gray-500 text-sm">
                              {lesson.duration || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:w-96">
            <div className="border rounded-lg p-4 shadow-lg bg-white -mt-32 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-[#49BBBD]">
                    {course.pricing.type === "free" ? "Free" : `₹${course.pricing.amount}`}
                  </span>
                  {course.pricing.type === "paid" && (
                    <>
                      {/* <span className="line-through ml-2 text-gray-500">
                        ₹{course.pricing.amount * 6}
                      </span> */}
                      {/* <span className="bg-red-500 text-white px-2 py-1 rounded ml-2">
                        {Math.round(
                          100 -
                            (course.pricing.amount / (course.pricing.amount * 6)) * 100
                        )}
                        % off
                      </span> */}
                    </>
                  )}
                </div>
                {/* {course.pricing.type === "paid" && (
                  <span className="text-red-500 text-sm">2 days left at this price!</span>
                )} */}
              </div>
              <div className="space-y-2 mb-4">
                <button className="w-full bg-[#49BBBD] text-white py-2 rounded hover:bg-[#3a9a9c]">
                 Enroll Now
                </button>
                {/* <button className="w-full border border-[#49BBBD] text-[#49BBBD] py-2 rounded hover:bg-[#49BBBD] hover:text-white">
                  Buy now
                </button> */}
              </div>
              {/* <p className="text-center text-gray-600 text-sm">30-Day Money-Back Guarantee</p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;