import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Sidebar from './InstructorSidebar';
import InstructorNavbar from './InstructorNavbar';
import { Menu, MessageCircle } from 'lucide-react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('chat');
  const [isMobile, setIsMobile] = useState(false);

  // Fetch loading and error states from Redux store
  const loading = useSelector((state: RootState) => state.course.loading);
  const error = useSelector((state: RootState) => state.course.error);

  // Check for mobile screen on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Check initially
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        currentPage={currentPage}
        onToggleSidebar={toggleSidebar}
        setCurrentPage={setCurrentPage}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen && !isMobile ? 'ml-64' : sidebarOpen && isMobile ? 'ml-0' : 'ml-0 md:ml-20'
        }`}
      >
        {/* Navbar */}
        <div className="bg-white shadow-md p-3 md:p-5 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-[#49BBBD] focus:outline-none focus:ring-2 focus:ring-[#49BBBD]"
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={sidebarOpen}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
              <h1 className="text-lg md:text-2xl font-bold text-gray-800 tracking-tight">Chat With Your Students</h1>
            </div>
          </div>
          <InstructorNavbar loading={loading} error={error} className="flex items-center gap-2 md:gap-3" />
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-3 md:p-6">{children}</div>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
};

export default ChatLayout;