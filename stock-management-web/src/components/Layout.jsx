import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar - hidden on profile page */}
        {!isProfilePage && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={(open) => setSidebarOpen(open)} 
          />
        )}
        
        {/* Main Content */}
        <main
          className={`
            flex-1 transition-all duration-300
            ${!isProfilePage ? (sidebarOpen ? 'ml-64' : 'ml-20') : 'ml-0'}
          `}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

