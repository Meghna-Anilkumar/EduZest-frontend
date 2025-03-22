import React from "react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  bannerImage: string;
  lessonsCount: number;
}

const InstructorCoursesPage: React.FC = () => {
  const navigate = useNavigate();

  const courses: Course[] = [
    {
      id: 1,
      title: "Introduction to Web Development",
      bannerImage: "https://via.placeholder.com/400x200",
      lessonsCount: 12,
    },
    {
      id: 2,
      title: "Advanced JavaScript Concepts",
      bannerImage: "https://via.placeholder.com/400x200",
      lessonsCount: 8,
    },
    {
      id: 3,
      title: "React for Beginners",
      bannerImage: "https://via.placeholder.com/400x200",
      lessonsCount: 15,
    },
    {
      id: 4,
      title: "Responsive Design Masterclass",
      bannerImage: "https://via.placeholder.com/400x200",
      lessonsCount: 10,
    },
    {
      id: 5,
      title: "TypeScript Fundamentals",
      bannerImage: "https://via.placeholder.com/400x200",
      lessonsCount: 6,
    },
  ];

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <button
          onClick={() => navigate("/instructor/courses/create")}
          className="flex items-center gap-2 bg-[#49BBBD] hover:bg-[#3a9a9c] text-white py-2 px-4 rounded-md transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create Course
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Course Banner Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.bannerImage}
                alt={`${course.title} banner`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Course Details */}
            <div className="p-5">
              <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                {course.title}
              </h3>
              <div className="flex items-center text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#49BBBD]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 017 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span>{course.lessonsCount} Lessons</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-5 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
              <button className="text-[#49BBBD] hover:text-[#3a9a9c] font-medium">
                Edit
              </button>
              <button className="text-[#49BBBD] hover:text-[#3a9a9c] font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No courses yet
          </h3>
          <p className="text-gray-600 mb-4 text-center">
            You haven't created any courses yet. Click the button below to get
            started.
          </p>
          <button
            onClick={() => navigate("/instructor/courses/create")}
            className="flex items-center gap-2 bg-[#49BBBD] hover:bg-[#3a9a9c] text-white py-2 px-4 rounded-md transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Your First Course
          </button>
        </div>
      )}
    </div>
  );
};

export default InstructorCoursesPage;
