import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../InstructorSidebar";
import InstructorNavbar from "../InstructorNavbar";
import ModuleViewModal from "./CourseModal"; // Import the new modal component

// Sample data interfaces
interface Lesson {
  lessonNumber: number;
  title: string;
  duration: string;
  description: string;
}

interface Module {
  moduleTitle: string;
  lessons: Lesson[];
}

const CourseDetailsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  // Sample modules data (replace with actual data)
  const modulesData: Module[] = [
    {
      moduleTitle: "Introduction to Web Development",
      lessons: [
        {
          lessonNumber: 1,
          title: "Understanding Web Development Basics",
          duration: "0.5",
          description: "Learn the fundamental concepts of web development and the technologies involved."
        },
        {
          lessonNumber: 2,
          title: "HTML5 Fundamentals",
          duration: "1",
          description: "Deep dive into HTML5 structure, semantic elements, and best practices."
        }
      ]
    },
    {
      moduleTitle: "CSS and Styling",
      lessons: [
        {
          lessonNumber: 1,
          title: "CSS Selectors and Specificity",
          duration: "0.75",
          description: "Master CSS selectors, cascading, and how to write efficient stylesheets."
        }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        currentPage="courses"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        setCurrentPage={() => {}}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <button 
                  onClick={() => navigate("/instructor/courses")}
                  className="text-gray-600 hover:text-gray-800 mr-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Course Details</h1>
              </div>
              <InstructorNavbar loading={false} error={null} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Overview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <img 
                    src="/api/placeholder/200/150" 
                    alt="Course Thumbnail" 
                    className="w-48 h-36 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Web Development Masterclass</h2>
                    <p className="text-gray-600">Learn Full Stack Web Development from Scratch</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="bg-[#49BBBD] text-white text-xs px-2 py-1 rounded">Intermediate</span>
                      <span className="text-gray-500 text-sm">12 Modules • 45 Lessons</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">
                  A comprehensive course covering front-end and back-end technologies. 
                  Learn modern web development practices with hands-on projects.
                </p>
              </div>

              {/* Modules Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Course Modules</h3>
                {modulesData.map((module, index) => (
                  <div key={index} className="border-b last:border-b-0 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800">{module.moduleTitle}</h4>
                        <p className="text-gray-600 text-sm">
                          {module.lessons.length} Lessons • {module.lessons.reduce((total, lesson) => total + parseFloat(lesson.duration), 0).toFixed(1)}h
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedModule(module)}
                        className="text-[#49BBBD] hover:text-[#3a9a9c]"
                      >
                        View Module
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#49BBBD]">45</div>
                    <div className="text-gray-600 text-sm">Total Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#49BBBD]">250</div>
                    <div className="text-gray-600 text-sm">Enrolled Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#49BBBD]">4.5</div>
                    <div className="text-gray-600 text-sm">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#49BBBD]">12h</div>
                    <div className="text-gray-600 text-sm">Total Duration</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-[#49BBBD] text-white py-2 rounded-md hover:bg-[#3a9a9c] transition-colors">
                    Edit Course
                  </button>
                  <button className="w-full border border-[#49BBBD] text-[#49BBBD] py-2 rounded-md hover:bg-[#49BBBD] hover:text-white transition-colors">
                    Add Module
                  </button>
                  <button className="w-full border border-red-500 text-red-500 py-2 rounded-md hover:bg-red-500 hover:text-white transition-colors">
                    Unpublish Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Module View Modal */}
        {selectedModule && (
          <ModuleViewModal 
            module={selectedModule} 
            onClose={() => setSelectedModule(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default CourseDetailsPage;