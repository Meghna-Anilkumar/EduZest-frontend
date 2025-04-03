import React from "react";

interface StudentSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile?: boolean;
  closeMobileMenu?: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMobile = false,
  closeMobileMenu
}) => {
  const tabs = ["Profile", "My Courses", "Assessments"];
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  return (
    <div className={`${isMobile ? "p-4 space-y-1" : "hidden md:block w-64 border-r p-4 space-y-1"}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
            activeTab === tab ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default StudentSidebar;