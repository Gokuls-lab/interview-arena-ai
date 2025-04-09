
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Error toast is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userType) => {
    setIsLoading(true);
    
    try {
      if (userType === 'recruiter') {
        await login('recruiter@example.com', 'password');
      } else {
        await login('jobseeker@example.com', 'password');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center items-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link to="/" className="text-interview-primary hover:text-interview-secondary inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold mt-6 mb-2">Welcome back</h1>
              <p className="text-gray-600">Sign in to continue to your account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-interview-primary hover:text-interview-secondary">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  onClick={() => handleDemoLogin('jobseeker')}
                  disabled={isLoading}
                >
                  Job Seeker Demo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDemoLogin('recruiter')}
                  disabled={isLoading}
                >
                  Recruiter Demo
                </Button>
              </div>
            </div>
            
            <p className="mt-8 text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-interview-primary hover:text-interview-secondary font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        
        {/* Right Panel - Image */}
        <div className="hidden lg:block lg:w-1/2 bg-interview-primary">
          <div className="h-full flex items-center justify-center p-12">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold text-white mb-6">Revolutionize your hiring and job search experience</h2>
              <p className="text-white/90 text-lg mb-8">
                Connect with top talent and opportunities through our AI-powered interview platform.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <h3 className="text-white font-semibold mb-2">For Job Seekers</h3>
                  <p className="text-white/80 text-sm">Practice interviews, get feedback, and find your dream job.</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <h3 className="text-white font-semibold mb-2">For Recruiters</h3>
                  <p className="text-white/80 text-sm">Find qualified candidates faster with AI-powered screening.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
