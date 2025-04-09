
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, UserRound, Video, Award, Building, Users, FolderSearch, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: <UserRound className="h-10 w-10 text-interview-primary" />,
    title: 'Smart Profiles',
    description: 'Create detailed candidate or recruiter profiles to match the perfect opportunities.'
  },
  {
    icon: <Video className="h-10 w-10 text-interview-primary" />,
    title: 'AI Video Interviews',
    description: 'Conduct realistic AI-powered interviews with real-time feedback and analysis.'
  },
  {
    icon: <BriefcaseBusiness className="h-10 w-10 text-interview-primary" />,
    title: 'Job Marketplace',
    description: 'Find and post jobs with detailed requirements and qualifications.'
  },
  {
    icon: <Award className="h-10 w-10 text-interview-primary" />,
    title: 'Mock Interviews',
    description: 'Practice with our AI to prepare for any role with personalized feedback.'
  },
  {
    icon: <Building className="h-10 w-10 text-interview-primary" />,
    title: 'Company Profiles',
    description: 'Showcase your organization and culture to attract top talent.'
  },
  {
    icon: <FolderSearch className="h-10 w-10 text-interview-primary" />,
    title: 'Application Tracking',
    description: 'Monitor your applications or candidate pipeline with ease.'
  }
];

const testimonials = [
  {
    quote: "InterviewArena helped me prepare for my technical interviews with realistic AI simulations. I got hired within a month!",
    author: "Alex Chen",
    role: "Software Engineer"
  },
  {
    quote: "As a recruiter, the platform saved me countless hours screening candidates while providing better insights into their abilities.",
    author: "Sarah Johnson",
    role: "HR Manager"
  },
  {
    quote: "The mock interview feature gave me the confidence and practice I needed to ace my interviews. Highly recommended!",
    author: "Michael Rodriguez",
    role: "Product Manager"
  }
];

const Index = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-bg py-16 md:py-24 text-white">
        <div className="container mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-8 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Revolutionize Your Job Search & Hiring Process
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              InterviewArena uses AI to connect the right talent with the right opportunities through intelligent interviews and personalized feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {currentUser ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-white text-interview-primary hover:bg-gray-100">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-white text-interview-primary hover:bg-gray-100">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Video interview" 
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-interview-primary rounded-lg p-4 shadow-lg">
                <Video className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline your job search or hiring process in one platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes interview preparation and candidate evaluation simple and effective.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-interview-light text-interview-primary text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Sign up as a job seeker or recruiter and complete your profile with skills, experience, and preferences.</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-interview-light text-interview-primary text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Connect & Apply</h3>
              <p className="text-gray-600">Browse job listings or candidate profiles, apply for positions or schedule interviews.</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-interview-light text-interview-primary text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Interview & Feedback</h3>
              <p className="text-gray-600">Conduct AI-powered interviews with automatic recording and receive detailed feedback and analysis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What People Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Thousands of job seekers and recruiters have transformed their hiring process with InterviewArena.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-interview-primary text-white flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Interview Experience?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Join thousands of job seekers and recruiters who are already using InterviewArena to connect talent with opportunity.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {currentUser ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-interview-primary hover:bg-gray-100">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-interview-primary hover:bg-gray-100">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Briefcase className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-white">InterviewArena</span>
              </div>
              <p className="mb-4">Revolutionizing the job interview process with AI-powered video interviews.</p>
            </div>
            
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/jobs" className="hover:text-white">Browse Jobs</Link></li>
                <li><Link to="/mock-interview" className="hover:text-white">Mock Interviews</Link></li>
                <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Interview Tips</a></li>
                <li><a href="#" className="hover:text-white">Resume Builder</a></li>
                <li><a href="#" className="hover:text-white">Career Advice</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>support@interviewarena.com</li>
                <li>1-800-INTERVIEW</li>
                <li>123 Tech Plaza, San Francisco, CA</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p>© 2023 InterviewArena. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
