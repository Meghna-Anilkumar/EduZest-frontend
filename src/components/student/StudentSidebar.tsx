import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CreditCard, User, BarChart } from "lucide-react";

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
  closeMobileMenu,
}) => {
  const tabs = ["Profile", "My Courses", "My Progress", "Payments"];
  const navigate = useNavigate();

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);

    if (tab === "My Courses") {
      navigate("/student/my-enrollments");
    } else if (tab === "Payments") {
      navigate("/student/payments");
    } else if (tab === "Profile") {
      navigate("/profile");
    } else if (tab === "My Progress") {
      navigate("/student/progress");
    }
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  const tabIcons = {
    "My Courses": <BookOpen className="w-6 h-6 mr-3" />,
    Profile: <User className="w-6 h-6 mr-3" />,
    "My Progress": <BarChart className="w-6 h-6 mr-3" />,
    Payments: <CreditCard className="w-6 h-6 mr-3" />,
  };

  return (
    <div
      className={`
      ${
        isMobile
          ? "p-4 space-y-2"
          : "hidden md:block w-64 border-r bg-gradient-to-br from-gray-100 to-white p-4 space-y-2 shadow-lg h-screen"
      }
      pt-32 md:pt-32 mt-0 fixed md:fixed top-0 left-0 overflow-y-auto
    `}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`
            w-full text-left px-4 py-3 rounded-lg font-bold text-lg flex items-center transition-all duration-200
            ${
              activeTab === tab
                ? "bg-gradient-to-r from-[#49bbbd] to-[#49bbbd] text-white shadow-md transform scale-105 border-l-4 border-yellow-400"
                : "text-gray-700 hover:bg-gray-300 hover:text-gray-900"
            }
          `}
        >
          {tabIcons[tab as keyof typeof tabIcons]}
          <span className="truncate">{tab}</span>
        </button>
      ))}
    </div>
  );
};

export default StudentSidebar;
