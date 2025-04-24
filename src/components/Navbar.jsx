
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Briefcase, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout, isRecruiter, isJobSeeker } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group">
                <Briefcase className="h-8 w-8 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                <span className="ml-2 text-xl font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">InterviewArena</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/') ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'} transition-colors`}>
                Home
              </Link>
              <Link to="/jobs" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/jobs') ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'} transition-colors`}>
                Jobs
              </Link>
              {isRecruiter && (
                <>
                <Link to="/create-job" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/create-job') ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'} transition-colors`}>
                  Post Job
                </Link>
                <Link to="/interviews" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/interviews') ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'} transition-colors`}>
                View Result
                </Link>
                </>
              )}
              {isJobSeeker && (
                <Link to="/mock-interview" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/mock-interview') ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'} transition-colors`}>
                  Mock Interview
                </Link>
                
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <div className="relative ml-3 flex items-center">
                <div className="relative">
                  <button className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2">
                    <span className="sr-only">Search</span>
                    <Search className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <Link to="/profile" className={`flex items-center text-sm font-medium ${isActive('/profile') ? 'text-indigo-600' : 'text-gray-700 hover:text-gray-900'} transition-colors`}>
                    <User className="h-5 w-5 mr-1" />
                    {currentUser.name || 'Profile'}
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" 
              className={`block px-3 py-2 text-base font-medium ${isActive('/') ? 'text-indigo-600 border-l-4 border-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link to="/jobs" 
              className={`block px-3 py-2 text-base font-medium ${isActive('/jobs') ? 'text-indigo-600 border-l-4 border-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
            {isRecruiter && (
              <Link to="/create-job" 
                className={`block px-3 py-2 text-base font-medium ${isActive('/create-job') ? 'text-indigo-600 border-l-4 border-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Post Job
              </Link>
            )}
            {isJobSeeker && (
              <Link to="/mock-interview" 
                className={`block px-3 py-2 text-base font-medium ${isActive('/mock-interview') ? 'text-indigo-600 border-l-4 border-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Mock Interview
              </Link>
            )}
          </div>
          {currentUser ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    {currentUser.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{currentUser.name}</div>
                  <div className="text-sm font-medium text-gray-500">{currentUser.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link to="/profile" 
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <Link to="/dashboard" 
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex flex-col space-y-2 px-4">
                <Link to="/login" 
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link to="/register" 
                  className="block px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
