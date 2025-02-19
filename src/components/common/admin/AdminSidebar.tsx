import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  RiDashboardLine,
  RiUserLine,
  RiTeamLine,
  RiBookOpenLine,
  RiPriceTag3Line,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine
} from 'react-icons/ri';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: RiDashboardLine },
    { path: '/admin/students', name: 'Students', icon: RiUserLine },
    { path: '/admin/instructors', name: 'Instructors', icon: RiTeamLine },
    { path: '/admin/courses', name: 'Courses', icon: RiBookOpenLine },
    { path: '/admin/categories', name: 'Categories', icon: RiPriceTag3Line },
    { path: '/admin/assessments', name: 'Assessments', icon: RiFileList3Line },
    { path: '/admin/transactions', name: 'Transactions', icon: RiMoneyDollarCircleLine },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      className={`min-h-screen bg-gray-900 text-gray-100 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? <RiMenuUnfoldLine size={20} /> : <RiMenuFoldLine size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors
              ${isActive(item.path) 
                ? 'bg-[#49bbbd] text-white' 
                : 'hover:bg-gray-800 text-gray-300'}`}
          >
            <item.icon size={20} className="min-w-[20px]" />
            {!isCollapsed && (
              <span className="ml-4 whitespace-nowrap">{item.name}</span>
            )}
          </Link>
        ))}
      </nav>

      
    </div>
  );
};

export default Sidebar;