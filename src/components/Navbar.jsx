
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Briefcase, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout, isRecruiter, isJobSeeker } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Briefcase className="h-8 w-8 text-interview-primary" />
                <span className="ml-2 text-xl font-bold text-interview-primary">InterviewArena</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                Home
              </Link>
              <Link to="/jobs" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                Jobs
              </Link>
              {isRecruiter && (
                <Link to="/create-job" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  Post Job
                </Link>
              )}
              {isJobSeeker && (
                <Link to="/mock-interview" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  Mock Interview
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <div className="relative ml-3">
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    <User className="h-5 w-5 mr-1" />
                    {currentUser.name || 'Profile'}
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-interview-primary"
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
              className="block px-3 py-2 text-base font-medium text-gray-900 border-l-4 border-interview-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link to="/jobs" 
              className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
            {isRecruiter && (
              <Link to="/create-job" 
                className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Post Job
              </Link>
            )}
            {isJobSeeker && (
              <Link to="/mock-interview" 
                className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300"
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
                  <div className="h-10 w-10 rounded-full bg-interview-primary text-white flex items-center justify-center">
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
                  className="block px-4 py-2 text-base font-medium text-white bg-interview-primary hover:bg-interview-secondary rounded-md"
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
