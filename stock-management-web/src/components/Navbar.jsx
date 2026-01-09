import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      dispatch(showSnackbar({ message: 'Logged out successfully', severity: 'success' }));
      navigate('/signin');
    } catch (error) {
      dispatch(showSnackbar({ message: 'Logout failed', severity: 'error' }));
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile menu if clicking outside
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      // Close mobile menu if clicking outside
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isProfileMenuOpen || isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen, isMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-blue-600 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-white text-xl font-bold">Stock Management</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <FaUser className="w-4 h-4" />
                <span>{user?.name || 'User'}</span>
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[60] border border-gray-200">
                    <button
                      onClick={handleProfileClick}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                    >
                      <FaUser className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-blue-700 p-2 rounded-md transition-colors"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="md:hidden pb-4 relative z-[60]" ref={mobileMenuRef}>
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
                className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleProfileClick}
                className="block w-full text-left text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-colors"
            >
              <FaUser className="w-4 h-4" />
              <span>View Profile</span>
            </button>
            <button
              onClick={handleLogout}
                className="block w-full text-left text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-colors"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

