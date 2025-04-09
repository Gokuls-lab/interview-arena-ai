
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata
          });
        } else {
          setCurrentUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          ...session.user.user_metadata
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast.success('Login successful!');
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            company: userData.company || null
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Registration successful!');
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: profileData
      });
      
      if (authError) throw authError;
      
      // Update profile record in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', currentUser.id);
        
      if (profileError) throw profileError;
      
      // Update local state
      setCurrentUser({ ...currentUser, ...profileData });
      
      toast.success('Profile updated successfully!');
      return { ...currentUser, ...profileData };
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Profile update failed');
      throw error;
    }
  };

  const value = {
    currentUser,
    session,
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
