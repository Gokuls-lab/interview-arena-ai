import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Search, 
  Filter, 
  UserCheck,
  UserX,
  Video,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/services/api';

const statusColors = {
  applied: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  interview_scheduled: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  offered: 'bg-green-100 text-green-800',
  hired: 'bg-emerald-100 text-emerald-800',
  withdrawn: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  applied: 'Applied',
  review: 'Under Review',
  interview_scheduled: 'Interview Scheduled',
  rejected: 'Rejected',
  offered: 'Offer Extended',
  hired: 'Hired',
  withdrawn: 'Withdrawn'
};

const Applications = () => {
  const { currentUser, isRecruiter } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [schedulingApplication, setSchedulingApplication] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get all jobs first
        const jobsData = await API.jobs.getAll();
        setJobs(jobsData);
        
        // Get applications
        let applicationsData = await API.applications.getAll();
        
        // If not recruiter, filter to only show current user's applications
        if (!isRecruiter) {
          applicationsData = applicationsData.filter(app => app.userId === currentUser.id);
        }
        
        // Enhance applications with job details
        const enhancedApplications = applicationsData.map(app => {
          const job = jobsData.find(job => job.id === app.jobId) || {};
          return {
            ...app,
            jobTitle: job.title || 'Unknown Job',
            company: job.company || 'Unknown Company',
            salary: job.salary,
            location: job.location
          };
        });
        
        setApplications(enhancedApplications);
      } catch (error) {
        console.error('Error loading applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [currentUser, isRecruiter]);
  
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
  };
  
  const handleScheduleInterview = (application) => {
    setSchedulingApplication(application);
    
    // Default to tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setInterviewDate(tomorrow.toISOString().split('T')[0]);
    setInterviewTime('10:00');
  };
  
  const confirmScheduleInterview = async () => {
    if (!interviewDate || !interviewTime) {
      toast.error('Please select both date and time');
      return;
    }
    
    setUpdatingStatus(true);
    
    try {
      // Format the date and time
      const scheduledDateTime = `${interviewDate}T${interviewTime}:00`;
      
      // Create an interview
      await API.interviews.schedule({
        jobId: schedulingApplication.jobId,
        applicationId: schedulingApplication.id,
        candidateId: schedulingApplication.userId,
        scheduledDate: scheduledDateTime,
        status: 'scheduled'
      });
      
      // Update application status
      await API.applications.updateStatus(schedulingApplication.id, 'interview_scheduled');
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === schedulingApplication.id 
          ? { ...app, status: 'interview_scheduled', interviewDate: scheduledDateTime }
          : app
      ));
      
      toast.success('Interview scheduled successfully');
      setSchedulingApplication(null);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const updateApplicationStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(true);
    
    try {
      await API.applications.updateStatus(applicationId, newStatus);
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      toast.success(`Application status updated to ${statusLabels[newStatus]}`);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesJob = !jobFilter || app.jobId === parseInt(jobFilter);
    
    return matchesSearch && matchesStatus && matchesJob;
  });
  
  const countByStatus = {
    all: applications.length,
    applied: applications.filter(app => app.status === 'applied').length,
    review: applications.filter(app => app.status === 'review').length,
    interview_scheduled: applications.filter(app => app.status === 'interview_scheduled').length,
    offered: applications.filter(app => app.status === 'offered').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-gray-600 mt-1">
              {isRecruiter
                ? 'Manage candidate applications for your job postings'
                : 'Track the status of your job applications'
              }
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filter by Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant={statusFilter === '' ? 'default' : 'outline'} 
                  className="w-full justify-start"
                  onClick={() => setStatusFilter('')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  All Applications
                  <Badge className="ml-auto">{countByStatus.all}</Badge>
                </Button>
                
                <Button 
                  variant={statusFilter === 'applied' ? 'default' : 'outline'} 
                  className="w-full justify-start"
                  onClick={() => setStatusFilter('applied')}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Applied
                  <Badge className="ml-auto">{countByStatus.applied}</Badge>
                </Button>
                
                <Button 
                  variant={statusFilter === 'review' ? 'default' : 'outline'} 
                  className="w-full justify-start"
                  onClick={() => setStatusFilter('review')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Under Review
                  <Badge className="ml-auto">{countByStatus.review}</Badge>
                </Button>
                
                <Button 
                  variant={statusFilter === 'interview_scheduled' ? 'default' : 'outline'} 
                  className="w-full justify-start"
                  onClick={() => setStatusFilter('interview_scheduled')}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Interview Scheduled
                  <Badge className="ml-auto">{countByStatus.interview_scheduled}</Badge>
                </Button>
                
                <Button 
                  variant={statusFilter === 'offered' ? 'default' : 'outline'} 
                  className="w-full justify-start"
                  onClick={() => setStatusFilter('offered')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Offered
                  <Badge className="ml-auto">{countByStatus.offered}</Badge>
                </Button>
                
                <Button 
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'} 
                  className="w-full justify-start"
                  onClick={() => setStatusFilter('rejected')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejected
                  <Badge className="ml-auto">{countByStatus.rejected}</Badge>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      type="text"
                      placeholder="Search applications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="md:w-1/3">
                    <Select value={jobFilter} onValueChange={setJobFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by job" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Jobs</SelectItem>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-interview-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No applications found</h3>
                  <p className="text-gray-500 mb-4">
                    {isRecruiter 
                      ? "You don't have any applications matching your criteria" 
                      : "You haven't applied to any jobs yet"
                    }
                  </p>
                  {!isRecruiter && (
                    <Link to="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Applications</CardTitle>
                  <CardDescription>
                    {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredApplications.map((application) => (
                      <div 
                        key={application.id} 
                        className="flex flex-col sm:flex-row items-start border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="sm:w-8/12 mb-3 sm:mb-0 sm:pr-4">
                          <div className="flex items-center mb-1">
                            <h3 className="font-medium">{application.jobTitle}</h3>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${statusColors[application.status] || 'bg-gray-100'}`}>
                              {statusLabels[application.status] || 'Unknown'}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600">{application.company}</p>
                          
                          {application.applicationDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Applied on {new Date(application.applicationDate).toLocaleDateString()}
                            </p>
                          )}
                          
                          {application.interviewDate && (
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                Interview: {new Date(application.interviewDate).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="sm:w-4/12 flex flex-wrap gap-2 justify-start sm:justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewApplication(application)}
                          >
                            View Details
                          </Button>
                          
                          {isRecruiter && application.status === 'applied' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleScheduleInterview(application)}
                            >
                              Schedule Interview
                            </Button>
                          )}
                          
                          {application.status === 'interview_scheduled' && (
                            <Link to={`/interview/${application.jobId}`}>
                              <Button size="sm">
                                Join Interview
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                {selectedApplication.jobTitle} at {selectedApplication.company}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${statusColors[selectedApplication.status] || 'bg-gray-100'}`}>
                  {statusLabels[selectedApplication.status] || 'Unknown'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm font-medium block">Applied On</span>
                  <span className="text-sm text-gray-600">
                    {new Date(selectedApplication.applicationDate).toLocaleDateString()}
                  </span>
                </div>
                
                {selectedApplication.interviewDate && (
                  <div>
                    <span className="text-sm font-medium block">Interview Date</span>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedApplication.interviewDate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              
              {isRecruiter && selectedApplication.coverLetter && (
                <div>
                  <span className="text-sm font-medium block mb-1">Cover Letter</span>
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                    {selectedApplication.coverLetter}
                  </div>
                </div>
              )}
              
              {isRecruiter && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium mb-2">Update Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedApplication.status !== 'review' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'review')}
                        disabled={updatingStatus}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Mark as Reviewing
                      </Button>
                    )}
                    
                    {selectedApplication.status !== 'interview_scheduled' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleScheduleInterview(selectedApplication)}
                        disabled={updatingStatus}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Schedule Interview
                      </Button>
                    )}
                    
                    {selectedApplication.status !== 'offered' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'offered')}
                        disabled={updatingStatus}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Extend Offer
                      </Button>
                    )}
                    
                    {selectedApplication.status !== 'rejected' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                        disabled={updatingStatus}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {isRecruiter && (
                <div className="pt-4 border-t border-gray-200">
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Candidate
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {schedulingApplication && (
        <Dialog open={!!schedulingApplication} onOpenChange={() => setSchedulingApplication(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Schedule an interview for {schedulingApplication.jobTitle}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interview-date">Date</Label>
                  <Input
                    id="interview-date"
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interview-time">Time</Label>
                  <Input
                    id="interview-time"
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                <p>The candidate will receive a notification about the scheduled interview.</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSchedulingApplication(null)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmScheduleInterview}
                disabled={updatingStatus || !interviewDate || !interviewTime}
              >
                {updatingStatus ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Applications;
