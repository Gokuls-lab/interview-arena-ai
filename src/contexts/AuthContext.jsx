
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const user = localStorage.getItem('interviewUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        // Check mock users (in a real app, this would be an API call)
        const mockUsers = [
          { id: 1, email: 'recruiter@example.com', password: 'password', name: 'John Smith', role: 'recruiter', company: 'Tech Solutions Inc.' },
          { id: 2, email: 'jobseeker@example.com', password: 'password', name: 'Sarah Johnson', role: 'jobseeker' }
        ];
        
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          // Remove password before storing
          const { password, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
          localStorage.setItem('interviewUser', JSON.stringify(userWithoutPassword));
          toast.success('Login successful!');
          resolve(userWithoutPassword);
        } else {
          toast.error('Invalid email or password');
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };

  const register = (userData) => {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        try {
          // In a real app, this would send data to an API
          const newUser = {
            id: Math.floor(Math.random() * 1000),
            ...userData,
          };
          
          // Remove password before storing
          const { password, ...userWithoutPassword } = newUser;
          setCurrentUser(userWithoutPassword);
          localStorage.setItem('interviewUser', JSON.stringify(userWithoutPassword));
          toast.success('Registration successful!');
          resolve(userWithoutPassword);
        } catch (error) {
          toast.error('Registration failed');
          reject(error);
        }
      }, 1500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('interviewUser');
    toast.success('Logged out successfully');
  };

  const updateProfile = (profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = { ...currentUser, ...profileData };
        setCurrentUser(updatedUser);
        localStorage.setItem('interviewUser', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
        resolve(updatedUser);
      }, 1000);
    });
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    isRecruiter: currentUser?.role === 'recruiter',
    isJobSeeker: currentUser?.role === 'jobseeker',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
