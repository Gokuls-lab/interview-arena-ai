
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  Clock, 
  Video, 
  Calendar, 
  Bookmark, 
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  FileText,
  Building,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/services/api';

const Dashboard = () => {
  const { currentUser, isRecruiter, isJobSeeker } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    upcomingInterviews: 0,
    offers: 0,
    postedJobs: 0,
    candidates: 0,
    activeJobs: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch jobs
        const jobs = await API.jobs.getAll();
        setRecentJobs(jobs.slice(0, 5));
        
        // Set mock stats
        if (isRecruiter) {
          setStats({
            postedJobs: jobs.length,
            candidates: 12,
            interviews: 5,
            upcomingInterviews: 2,
            activeJobs: jobs.length
          });
        } else {
          setStats({
            applications: 4,
            interviews: 2,
            upcomingInterviews: 1,
            offers: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isRecruiter, isJobSeeker]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {currentUser?.name || 'User'}! 
            {isRecruiter 
              ? ' Manage your job listings and candidates.' 
              : ' Track your job applications and interviews.'}
          </p>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isJobSeeker && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-interview-primary mr-2" />
                    <span className="text-2xl font-bold">{stats.applications}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-interview-primary mr-2" />
                    <span className="text-2xl font-bold">{stats.interviews}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-interview-primary mr-2" />
                    <span className="text-2xl font-bold">{stats.upcomingInterviews}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Offers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-interview-primary mr-2" />
                    <span className="text-2xl font-bold">{stats.offers}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {isRecruiter && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Posted Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-interview-primary mr-2" />
                    <span className="text-2xl font-bold">{stats.postedJobs}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-interview-primary mr-2" />
                    <span className="text-2xl font-bold">{stats.candidates}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-interview-primary mr-2" />
                    <span className="text-2xl font-bold">{stats.interviews}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-interview-primary mr-2" />
                    <span className="text-2xl font-bold">{stats.activeJobs}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isJobSeeker && <TabsTrigger value="applications">Applications</TabsTrigger>}
            {isRecruiter && <TabsTrigger value="jobs">Jobs</TabsTrigger>}
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with these common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isJobSeeker && (
                    <>
                      <Link to="/jobs">
                        <Button variant="outline" className="w-full justify-start">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Browse Jobs
                        </Button>
                      </Link>
                      <Link to="/mock-interview">
                        <Button variant="outline" className="w-full justify-start">
                          <Video className="mr-2 h-4 w-4" />
                          Practice Interview
                        </Button>
                      </Link>
                      <Link to="/profile">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          Update Profile
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {isRecruiter && (
                    <>
                      <Link to="/create-job">
                        <Button variant="outline" className="w-full justify-start">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Post New Job
                        </Button>
                      </Link>
                      <Link to="/applications">
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="mr-2 h-4 w-4" />
                          Review Applications
                        </Button>
                      </Link>
                      <Link to="/jobs">
                        <Button variant="outline" className="w-full justify-start">
                          <Building className="mr-2 h-4 w-4" />
                          Manage Job Listings
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest activities on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p>Loading recent activity...</p>
                  ) : (
                    <>
                      {isJobSeeker && (
                        <>
                          <div className="flex items-start">
                            <Bookmark className="h-5 w-5 text-interview-primary mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">You applied for Senior Frontend Developer position</p>
                              <p className="text-sm text-gray-500">2 days ago</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Video className="h-5 w-5 text-interview-primary mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">You completed a mock interview for Software Developer role</p>
                              <p className="text-sm text-gray-500">3 days ago</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-interview-primary mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">Your profile was updated</p>
                              <p className="text-sm text-gray-500">1 week ago</p>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {isRecruiter && (
                        <>
                          <div className="flex items-start">
                            <Briefcase className="h-5 w-5 text-interview-primary mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">You posted a new job: Senior Frontend Developer</p>
                              <p className="text-sm text-gray-500">2 days ago</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Users className="h-5 w-5 text-interview-primary mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">New application received for Senior Frontend Developer</p>
                              <p className="text-sm text-gray-500">3 days ago</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Video className="h-5 w-5 text-interview-primary mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">Interview scheduled with Sarah Johnson</p>
                              <p className="text-sm text-gray-500">1 week ago</p>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Activity</Button>
              </CardFooter>
            </Card>
            
            {/* Upcoming Interviews */}
            {stats.upcomingInterviews > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Interviews</CardTitle>
                  <CardDescription>Interviews scheduled in the next few days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-interview-light p-2 rounded-lg mr-4">
                        <Calendar className="h-6 w-6 text-interview-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Senior Frontend Developer</h3>
                            <p className="text-sm text-gray-500">Tech Solutions Inc.</p>
                          </div>
                          <Link to="/interview/1">
                            <Button variant="outline" size="sm">
                              Join
                            </Button>
                          </Link>
                        </div>
                        <div className="mt-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Tomorrow, 10:00 AM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Interviews</Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Recent Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Jobs</CardTitle>
                  <CardDescription>Latest job postings on the platform</CardDescription>
                </div>
                <Link to="/jobs">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p>Loading jobs...</p>
                  ) : (
                    recentJobs.map(job => (
                      <div key={job.id} className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="bg-interview-light p-2 rounded-lg mr-4">
                          <Briefcase className="h-6 w-6 text-interview-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <Link to={`/jobs/${job.id}`}>
                              <h3 className="font-medium hover:text-interview-primary">{job.title}</h3>
                            </Link>
                            <span className="text-sm text-gray-500">{job.postedDate}</span>
                          </div>
                          <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">{job.type}</span>
                            <span className="text-xs text-gray-500 ml-3">{job.salary}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isJobSeeker && (
            <TabsContent value="applications" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Applications</CardTitle>
                  <CardDescription>Track the status of your job applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start border-b border-gray-100 pb-4">
                      <div className="bg-interview-light p-2 rounded-lg mr-4">
                        <Briefcase className="h-6 w-6 text-interview-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Link to="/jobs/1">
                            <h3 className="font-medium hover:text-interview-primary">Senior Frontend Developer</h3>
                          </Link>
                          <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">Interview Scheduled</span>
                        </div>
                        <p className="text-sm text-gray-500">Tech Solutions Inc. • San Francisco, CA</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Applied on April 15, 2023</span>
                            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                              <Link to="/interview/1">Join Interview</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start border-b border-gray-100 pb-4">
                      <div className="bg-interview-light p-2 rounded-lg mr-4">
                        <Briefcase className="h-6 w-6 text-interview-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Link to="/jobs/2">
                            <h3 className="font-medium hover:text-interview-primary">Full Stack Developer</h3>
                          </Link>
                          <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">Application Received</span>
                        </div>
                        <p className="text-sm text-gray-500">Digital Innovations • Remote</p>
                        <div className="mt-2">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500">Applied on April 18, 2023</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start border-b border-gray-100 pb-4">
                      <div className="bg-interview-light p-2 rounded-lg mr-4">
                        <Briefcase className="h-6 w-6 text-interview-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Link to="/jobs/3">
                            <h3 className="font-medium hover:text-interview-primary">UX/UI Designer</h3>
                          </Link>
                          <span className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-1">Under Review</span>
                        </div>
                        <p className="text-sm text-gray-500">Creative Works • New York, NY</p>
                        <div className="mt-2">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500">Applied on April 20, 2023</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-interview-light p-2 rounded-lg mr-4">
                        <Briefcase className="h-6 w-6 text-interview-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Product Manager</h3>
                          <span className="text-xs bg-red-100 text-red-800 rounded-full px-2 py-1">Not Selected</span>
                        </div>
                        <p className="text-sm text-gray-500">Tech Innovators • Boston, MA</p>
                        <div className="mt-2">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500">Applied on April 10, 2023</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">View All Applications</Button>
                  <Link to="/jobs">
                    <Button>Browse More Jobs</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Application Statistics</CardTitle>
                  <CardDescription>Your job application activity and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Application to Interview Rate</span>
                        <span className="text-sm font-medium">50%</span>
                      </div>
                      <Progress value={50} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Interview to Offer Rate</span>
                        <span className="text-sm font-medium">0%</span>
                      </div>
                      <Progress value={0} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Most Applied Position</p>
                        <p className="font-medium">Software Developer</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Most Active Month</p>
                        <p className="font-medium">April 2023</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {isRecruiter && (
            <TabsContent value="jobs" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Job Listings</CardTitle>
                    <CardDescription>Manage your active job postings</CardDescription>
                  </div>
                  <Link to="/create-job">
                    <Button>Post New Job</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentJobs.map(job => (
                      <div key={job.id} className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="bg-interview-light p-2 rounded-lg mr-4">
                          <Briefcase className="h-6 w-6 text-interview-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <Link to={`/jobs/${job.id}`}>
                              <h3 className="font-medium hover:text-interview-primary">{job.title}</h3>
                            </Link>
                            <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">Active</span>
                          </div>
                          <p className="text-sm text-gray-500">{job.location} • Posted on {job.postedDate}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm">
                              <span className="font-medium">12</span> applicants
                            </span>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/jobs/${job.id}`}>View</Link>
                              </Button>
                              <Button variant="outline" size="sm">Edit</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Job Performance</CardTitle>
                  <CardDescription>Statistics about your job listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Total Views</p>
                        <p className="text-2xl font-medium">427</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Click-through Rate</p>
                        <p className="text-2xl font-medium">14.2%</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Application Rate</p>
                        <p className="text-2xl font-medium">2.8%</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-4">Top Performing Jobs</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Senior Frontend Developer</span>
                              <span className="text-sm font-medium">86%</span>
                            </div>
                            <Progress value={86} />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">UX/UI Designer</span>
                              <span className="text-sm font-medium">64%</span>
                            </div>
                            <Progress value={64} />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Full Stack Developer</span>
                              <span className="text-sm font-medium">42%</span>
                            </div>
                            <Progress value={42} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="interviews" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Interviews</CardTitle>
                <CardDescription>Manage your scheduled and past interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upcoming Interview */}
                  <div className="flex items-start border-b border-gray-100 pb-4">
                    <div className="bg-interview-light p-2 rounded-lg mr-4">
                      <Calendar className="h-6 w-6 text-interview-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Senior Frontend Developer</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">Upcoming</span>
                      </div>
                      <p className="text-sm text-gray-500">Tech Solutions Inc. • Tomorrow, 10:00 AM</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">30 min interview</span>
                          <Link to="/interview/1">
                            <Button variant="outline" size="sm">Join Interview</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Past Interview */}
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-lg mr-4">
                      <Video className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Mock Interview: Software Developer</h3>
                        <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">Completed</span>
                      </div>
                      <p className="text-sm text-gray-500">Practice Session • April 20, 2023</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                            <span className="text-gray-500">Score: 85/100</span>
                          </div>
                          <Button variant="link" size="sm" className="p-0 h-auto">View Feedback</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isJobSeeker && (
                  <Link to="/mock-interview">
                    <Button>Practice with AI</Button>
                  </Link>
                )}
                <Button variant="outline">View All Interviews</Button>
              </CardFooter>
            </Card>
            
            {isJobSeeker && (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Performance</CardTitle>
                  <CardDescription>Track your progress in interviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Mock Interviews</p>
                        <p className="text-2xl font-medium">5</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Average Score</p>
                        <p className="text-2xl font-medium">78%</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Best Performance</p>
                        <p className="text-2xl font-medium">92%</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-4">Skills Assessment</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Technical Knowledge</span>
                              <span className="text-sm font-medium">85%</span>
                            </div>
                            <Progress value={85} />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Communication</span>
                              <span className="text-sm font-medium">76%</span>
                            </div>
                            <Progress value={76} />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Problem Solving</span>
                              <span className="text-sm font-medium">82%</span>
                            </div>
                            <Progress value={82} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/mock-interview" className="w-full">
                    <Button className="w-full">Practice to Improve Skills</Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
