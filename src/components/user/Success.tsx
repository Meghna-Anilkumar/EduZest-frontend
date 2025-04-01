import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const EnrollmentSuccessPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Enrolled Successfully!</h1>
        <p className="text-gray-600 mb-6">
          You have successfully enrolled in the course. Start learning now!
        </p>
        <Link
          to="/my-courses"
          className="inline-block bg-[#49BBBD] text-white py-2 px-4 rounded hover:bg-[#3a9a9c]"
        >
          Go to My Courses
        </Link>
      </div>
    </div>
  );
};

export default EnrollmentSuccessPage;