import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface SidebarProps {
  open: boolean;
  currentPage: string;
  onToggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  currentPage,
  onToggleSidebar,
  setCurrentPage,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const linkClasses = (page: string) =>
    `px-4 py-4 flex items-center text-gray-300 hover:bg-gray-900 hover:text-white transition-colors rounded-l-xl ${
      currentPage === page
        ? "bg-gray-900 text-white border-r-4 border-[#49BBBD]"
        : ""
    }`;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 bg-black overflow-hidden flex flex-col shadow-lg transition-all duration-300 ${
        open ? "w-64" : "w-20"
      } ${isMobile && !open ? "-translate-x-full" : "translate-x-0"}`}
    >
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center px-4 py-6 mt-3">
            <button
              onClick={onToggleSidebar}
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle sidebar"
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
            {open && (
              <span
                className={`font-semibold text-lg text-white ml-3 transition-opacity duration-300 ${
                  open ? "opacity-100" : "opacity-0"
                }`}
              >
                Instructor
              </span>
            )}
          </div>
          <nav className="flex-1 flex flex-col space-y-2 mt-6">
            <a
              href="/dashboard"
              className={linkClasses("dashboard")}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("dashboard");
                navigate("/instructor/dashboard");
              }}
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {open && (
                <span
                  className={`ml-3 transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Dashboard
                </span>
              )}
            </a>
            <a
              href="/instructor/transactions"
              className={linkClasses("transactions")}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("transactions");
                navigate("/instructor/transactions");
              }}
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              {open && (
                <span
                  className={`ml-3 transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Transactions
                </span>
              )}
            </a>
            <a
              href="/instructor/courses"
              className={linkClasses("courses")}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("courses");
                navigate("/instructor/courses");
              }}
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              {open && (
                <span
                  className={`ml-3 transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Courses
                </span>
              )}
            </a>
            <a
              href="/instructor/chat"
              className={linkClasses("chat")}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("chat");
                navigate("/instructor/chat");
              }}
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              {open && (
                <span
                  className={`ml-3 transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Chats
                </span>
              )}
            </a>
          </nav>
        </div>
        {/* Bottom section with accent color */}
        <div
          className={`mt-auto p-4 bg-[#49BBBD] bg-opacity-20 ${
            open ? "text-center" : ""
          }`}
        >
          {open ? (
            <div className="text-white text-sm">© 2025 Instructor Portal</div>
          ) : (
            <div className="flex justify-center">
              <div className="h-2 w-2 rounded-full bg-[#49BBBD]"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
