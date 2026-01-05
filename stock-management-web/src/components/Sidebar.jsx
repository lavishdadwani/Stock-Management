import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBox, 
  FaChartBar, 
  FaUsers, 
  FaCog, 
  FaChevronLeft, 
  FaChevronRight,
  FaWarehouse
} from 'react-icons/fa';

const Sidebar = ({ isOpen: controlledIsOpen, onToggle }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Use controlled state if provided, otherwise use internal state
  const sidebarOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const handleToggle = () => {
    const newState = !sidebarOpen;
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: FaHome,
      path: '/',
    },
    {
      name: 'Stock',
      icon: FaBox,
      path: '/stock',
    },
    {
      name: 'Inventory',
      icon: FaWarehouse,
      path: '/inventory',
    },
    {
      name: 'Reports',
      icon: FaChartBar,
      path: '/reports',
    },
    {
      name: 'Users',
      icon: FaUsers,
      path: '/users',
    },
    {
      name: 'Settings',
      icon: FaCog,
      path: '/settings',
    },
  ];


  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-30
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <button
          onClick={handleToggle}
          className="flex flex-col items-center justify-center w-full py-2 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          {sidebarOpen ? (
            <>
              <FaChevronLeft className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Close</span>
            </>
          ) : (
            <>
              <FaChevronRight className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Open</span>
            </>
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                w-full flex items-center px-4 py-3 text-left transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
              title={!sidebarOpen ? item.name : ''}
            >
              <Icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

