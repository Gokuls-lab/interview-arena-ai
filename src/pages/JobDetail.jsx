
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  ChevronLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Heart,
  Building,
  Users,
  Globe,
  ArrowUpRight,
  Video,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/services/api';

const JobDetail = () => {
  const { id } = useParams();
  const { currentUser, isRecruiter, isJobSeeker } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  
  useEffect(() => {
    const loadJobDetails = async () => {
      setIsLoading(true);
      try {
        const jobData = await API.jobs.getById(id);
        setJob(jobData);
        
        // Check if job is saved
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        setIsSaved(savedJobs.includes(parseInt(id)));
        
        // Check if user has applied
        const applications = await API.applications.getAll(currentUser?.id);
        setHasApplied(applications.some(app => app.jobId === parseInt(id)));
        
        // Load similar jobs
        const allJobs = await API.jobs.getAll();
        const filtered = allJobs
          .filter(j => j.id !== parseInt(id))
          .slice(0, 3);
        setSimilarJobs(filtered);
        
      } catch (error) {
        console.error('Error loading job details:', error);
        toast.error('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJobDetails();
  }, [id, currentUser]);
  
  const toggleSaveJob = () => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    let updatedSavedJobs;
    
    if (isSaved) {
      updatedSavedJobs = savedJobs.filter(jobId => jobId !== parseInt(id));
      toast.success('Job removed from saved jobs');
    } else {
      updatedSavedJobs = [...savedJobs, parseInt(id)];
      toast.success('Job saved to your list');
    }
    
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    setIsSaved(!isSaved);
  };
  
  const handleApply = async () => {
    if (!currentUser) {
      toast.error('Please log in to apply for this job');
      navigate('/login');
      return;
    }
    
    setIsApplying(true);
    
    try {
      await API.applications.create({
        jobId: parseInt(id),
        userId: currentUser.id,
        coverLetter,
        status: 'applied',
        applicationDate: new Date().toISOString()
      });
      
      setHasApplied(true);
      setShowApplyDialog(false);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleStartInterview = () => {
    // navigate(`http://localhost:3000/?id=${id}&user=${currentUser.id}`);
    window.location.href=`http://localhost:3000/?id=${id}&user=${currentUser.id}`;

  };
  
  const shareJob = async () => {
    try {
      await navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: window.location.href,
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing job:', error);
        
        // Fallback for browsers that don't support navigator.share
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-interview-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="text-gray-500 mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/jobs">
              <Button>Browse All Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/jobs" className="text-interview-primary hover:text-interview-secondary inline-flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start">
                  <div className="bg-interview-light p-4 rounded-lg mr-6 mb-4 md:mb-0 flex-shrink-0">
                    <Briefcase className="h-8 w-8 text-interview-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                      <div>
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                      
                      <div className="flex mt-3 sm:mt-0 space-x-2">
                        <Button variant="outline" size="icon" onClick={shareJob}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={toggleSaveJob}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="h-4 w-4 text-interview-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Posted on {job.postedDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      {isJobSeeker ? (
                        hasApplied ? (
                          <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-md">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span>Application Submitted</span>
                          </div>
                        ) : (
                          <>
                            <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                              <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto">Apply Now</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Apply for {job.title}</DialogTitle>
                                  <DialogDescription>
                                    Submit your application to {job.company}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Cover Letter (Optional)</h4>
                                    <Textarea
                                      placeholder="Tell the employer why you're a good fit for this position..."
                                      value={coverLetter}
                                      onChange={(e) => setCoverLetter(e.target.value)}
                                      rows={6}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm">
                                    <Upload className="h-4 w-4 text-gray-500" />
                                    <span>Your resume will be attached automatically</span>
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={handleApply} 
                                    disabled={isApplying}
                                  >
                                    {isApplying ? 'Submitting...' : 'Submit Application'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button variant="outline" onClick={handleStartInterview}>
                              <Video className="h-4 w-4 mr-2" />
                              Start Interview
                            </Button>
                          </>
                        )
                      ) : isRecruiter ? (
                        <Button variant="outline">
                          Edit Job
                        </Button>
                      ) : (
                        <Button onClick={() => navigate('/login')}>
                          Sign in to Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="mb-4">{job.description}</p>
                  
                  <h3 className="text-lg font-medium mt-6 mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1 mb-6">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>About {job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    {job.company} is a leading company in its field, committed to innovation and excellence.
                    We're dedicated to creating a diverse and inclusive workplace where everyone can thrive.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      <span>Founded in 2010</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>100-500 employees</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>www.{job.company.toLowerCase().replace(/\s+/g, '')}.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex">
                    <dt className="w-1/3 text-gray-500">Job Type</dt>
                    <dd className="w-2/3 font-medium">{job.type}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-1/3 text-gray-500">Location</dt>
                    <dd className="w-2/3 font-medium">{job.location}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-1/3 text-gray-500">Salary</dt>
                    <dd className="w-2/3 font-medium">{job.salary}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-1/3 text-gray-500">Posted</dt>
                    <dd className="w-2/3 font-medium">{job.postedDate}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {similarJobs.length === 0 ? (
                    <p className="text-sm text-gray-500">No similar jobs found</p>
                  ) : (
                    similarJobs.map(job => (
                      <Link key={job.id} to={`/jobs/${job.id}`}>
                        <div className="group border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                          <h3 className="font-medium group-hover:text-interview-primary">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/jobs" className="text-interview-primary hover:text-interview-secondary text-sm flex items-center w-full">
                  <span>View all jobs</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Job Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={toggleSaveJob}>
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2 text-interview-primary" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save Job
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" onClick={shareJob}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Job
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Follow Company
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
