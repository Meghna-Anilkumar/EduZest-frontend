import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../../redux/actions/auth/adminLogoutAction";
import {
  RiDashboardLine,
  RiUserLine,
  RiTeamLine,
  RiBookOpenLine,
  RiPriceTag3Line,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiLogoutBoxLine,
  RiMailLine,
} from "react-icons/ri";
import { AppDispatch } from "../../../redux/store";

interface SidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobile = false,
  onCloseMobile,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (!isMobile && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (!isMobile && window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const menuItems = [
    { path: "/admin/dashboard", name: "Dashboard", icon: RiDashboardLine },
    { path: "/admin/students", name: "Students", icon: RiUserLine },
    { path: "/admin/instructors", name: "Instructors", icon: RiTeamLine },
    { path: "/admin/courses", name: "Courses", icon: RiBookOpenLine },
    { path: "/admin/categories", name: "Categories", icon: RiPriceTag3Line },
    { path: "/admin/requests", name: "Requests", icon: RiMailLine },
    { path: "/admin/assessments", name: "Assessments", icon: RiFileList3Line },
    {
      path: "/admin/transactions",
      name: "Transactions",
      icon: RiMoneyDollarCircleLine,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/login");
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleMenuClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div
      className={`bg-gray-900 text-gray-100 transition-all duration-300 overflow-y-auto h-screen
        ${isCollapsed ? "w-20" : "w-64"}
        ${isMobile ? "w-64" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {(!isCollapsed || isMobile) && (
          <h1 className="text-xl font-bold text-white truncate">Admin Panel</h1>
        )}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <RiMenuUnfoldLine size={20} />
            ) : (
              <RiMenuFoldLine size={20} />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleMenuClick}
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors
              ${
                isActive(item.path)
                  ? "bg-[#49bbbd] text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            aria-current={isActive(item.path) ? "page" : undefined}
          >
            <item.icon size={20} className="min-w-[20px]" />
            {(!isCollapsed || isMobile) && (
              <span className="ml-4 whitespace-nowrap">{item.name}</span>
            )}
          </Link>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 mt-6 rounded-lg transition-colors w-full hover:bg-red-600 text-gray-300"
          aria-label="Logout"
        >
          <RiLogoutBoxLine size={20} className="min-w-[20px]" />
          {(!isCollapsed || isMobile) && (
            <span className="ml-4 whitespace-nowrap">Logout</span>
          )}
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
