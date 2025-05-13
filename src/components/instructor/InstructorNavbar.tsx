import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface InstructorNavbarProps {
  loading: boolean;
  error: string;
  className?: string;
}

const InstructorNavbar: React.FC<InstructorNavbarProps> = ({ loading, error }) => {
  const navigate = useNavigate();
  const { userData } = useSelector((state: RootState) => state.user);

  // Navigate to home page
  const handleNavigateHome = () => {
    navigate("/"); // Adjust the route as needed (e.g., "/home" or "/dashboard")
  };

  // Navigate to profile page
  const handleNavigateProfile = () => {
    navigate("/profile");
  };

  // Get the first letter of the user's name, or a default if name is unavailable
  const firstLetter = userData?.name
    ? userData.name.charAt(0).toUpperCase()
    : "I";

  return (
    <div className="flex items-center space-x-4">
      {/* Home Icon */}
      <button
        onClick={handleNavigateHome}
        className="text-[#49BBBD] hover:text-[#3a9a9c] focus:outline-none"
        title="Go to Home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
      </button>

      {/* User Profile Icon */}
      {loading ? (
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
      ) : error ? (
        <button
          onClick={handleNavigateProfile}
          className="w-10 h-10 rounded-full bg-[#49BBBD] flex items-center justify-center text-white font-medium cursor-pointer hover:bg-[#3a9a9c] transition-colors"
          title="View Profile"
        >
          I
        </button>
      ) : (
        <button
          onClick={handleNavigateProfile}
          className="w-10 h-10 rounded-full bg-[#49BBBD] flex items-center justify-center text-white font-medium cursor-pointer hover:bg-[#3a9a9c] transition-colors"
          title="View Profile"
        >
          {firstLetter}
        </button>
      )}
    </div>
  );
};

export default InstructorNavbar;