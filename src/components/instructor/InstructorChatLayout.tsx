import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Sidebar from './InstructorSidebar';
import InstructorNavbar from './InstructorNavbar';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('chat');

  // Fetch loading and error states from Redux store
  const loading = useSelector((state: RootState) => state.course.loading);
  const error = useSelector((state: RootState) => state.course.error);

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
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Navbar */}
        <div className="bg-white shadow-md p-5 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Course Chats</h1>
          <InstructorNavbar loading={loading} error={error} />
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden bg-gray-50">{children}</div>
      </div>
    </div>
  );
};

export default ChatLayout;