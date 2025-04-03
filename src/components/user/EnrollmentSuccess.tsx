import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Header from "../common/users/Header";

const EnrollmentSuccessPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex-grow flex items-center justify-center px-4 pt-24 pb-8">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Enrolled Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            You have successfully enrolled in the course. Start learning now!
          </p>
          <Link
            to="/my-courses"
            className="inline-flex items-center bg-[#49BBBD] text-black font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-[#49BBBD] hover:shadow-md transition duration-300"
          >
            Go to My Courses
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 bg-black">
        <div className="container mx-auto px-4 text-center text-white text-sm">
          <p>&copy; {new Date().getFullYear()} EduZest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EnrollmentSuccessPage;
