
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'jobseeker',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (formData.role === 'recruiter' && !formData.company) {
      toast.error('Please enter your company name');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
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
              <h1 className="text-3xl font-bold mt-6 mb-2">Create an account</h1>
              <p className="text-gray-600">Join our platform and start your journey</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">I want to</Label>
                <RadioGroup 
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="jobseeker" id="jobseeker" />
                    <Label htmlFor="jobseeker" className="cursor-pointer">Find a job</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recruiter" id="recruiter" />
                    <Label htmlFor="recruiter" className="cursor-pointer">Hire talent</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              {formData.role === 'recruiter' && (
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Enter your company name"
                      className="pl-10"
                      value={formData.company}
                      onChange={handleChange}
                      required={formData.role === 'recruiter'}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleChange}
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="rounded border-gray-300 text-interview-primary focus:ring-interview-primary"
                  required
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the <a href="#" className="text-interview-primary hover:text-interview-secondary">Terms of Service</a> and <a href="#" className="text-interview-primary hover:text-interview-secondary">Privacy Policy</a>
                </Label>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            
            <p className="mt-8 text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-interview-primary hover:text-interview-secondary font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        
        {/* Right Panel - Image */}
        <div className="hidden lg:block lg:w-1/2 bg-interview-primary">
          <div className="h-full flex items-center justify-center p-12">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold text-white mb-6">Join our community of talent and opportunity</h2>
              <p className="text-white/90 text-lg mb-8">
                InterviewArena connects job seekers with employers through AI-powered interviews and personalized feedback.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">✓</div>
                  <span className="ml-3 text-white/90">Access to AI-powered mock interviews</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">✓</div>
                  <span className="ml-3 text-white/90">Personalized feedback on your interview performance</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">✓</div>
                  <span className="ml-3 text-white/90">Connect with top companies and talent</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">✓</div>
                  <span className="ml-3 text-white/90">Streamlined hiring process with video recordings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
