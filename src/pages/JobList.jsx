
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Filter,
  X,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/services/api';

const JobList = () => {
  const { currentUser, isRecruiter } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const data = await API.jobs.getAll();
        setJobs(data);
        
        // Load saved jobs from local storage
        const saved = localStorage.getItem('savedJobs');
        if (saved) {
          setSavedJobs(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
        toast.error('Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJobs();
  }, []);
  
  const toggleSaveJob = (jobId) => {
    let updatedSavedJobs;
    
    if (savedJobs.includes(jobId)) {
      updatedSavedJobs = savedJobs.filter(id => id !== jobId);
      toast.success('Job removed from saved jobs');
    } else {
      updatedSavedJobs = [...savedJobs, jobId];
      toast.success('Job saved to your list');
    }
    
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
  };
  
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesType = !jobType || job.type === jobType;
    
    return matchesSearch && matchesLocation && matchesType;
  });
  
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Remote', 'Boston, MA', 'Seattle, WA'];
  
  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setJobType('');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Jobs</h1>
            <p className="text-gray-600 mt-1">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
            </p>
          </div>
          
          {isRecruiter && (
            <Link to="/create-job" className="mt-4 md:mt-0">
              <Button>
                <Briefcase className="mr-2 h-4 w-4" />
                Post a Job
              </Button>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters - Desktop */}
          <div className="hidden lg:block space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Filters</span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <div className="space-y-2">
                    {jobTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`} 
                          checked={jobType === type}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setJobType(type);
                            } else {
                              setJobType('');
                            }
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any location</SelectItem>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <div className="space-y-2">
                    {['Entry Level', 'Mid Level', 'Senior Level', 'Manager', 'Director'].map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox id={`level-${level}`} />
                        <Label htmlFor={`level-${level}`} className="text-sm font-normal cursor-pointer">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Saved Jobs</CardTitle>
                <CardDescription>
                  {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedJobs.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    You haven't saved any jobs yet. Click the bookmark icon to save jobs you're interested in.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {jobs
                      .filter(job => savedJobs.includes(job.id))
                      .slice(0, 3)
                      .map(job => (
                        <Link key={job.id} to={`/jobs/${job.id}`} className="block">
                          <div className="group flex items-start hover:bg-gray-50 p-2 rounded-md -mx-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-interview-primary">
                                {job.title}
                              </h4>
                              <p className="text-xs text-gray-500 truncate">
                                {job.company}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    }
                    
                    {savedJobs.length > 3 && (
                      <Button variant="link" className="text-sm p-0 h-auto w-full justify-start">
                        View all saved jobs
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filter - Mobile & Desktop */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      type="text"
                      placeholder="Search jobs, companies, or keywords"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="md:w-1/4">
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any location</SelectItem>
                        {locations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="md:hidden flex items-center"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
                
                {/* Mobile Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t md:hidden">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear all
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Job Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {jobTypes.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`mobile-type-${type}`} 
                                checked={jobType === type}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setJobType(type);
                                  } else {
                                    setJobType('');
                                  }
                                }}
                              />
                              <Label htmlFor={`mobile-type-${type}`} className="text-sm font-normal cursor-pointer">
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Job Listings */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-interview-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button onClick={clearFilters}>Clear filters</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <div className="bg-interview-light p-3 rounded-lg mr-4">
                          <Briefcase className="h-6 w-6 text-interview-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <Link to={`/jobs/${job.id}`}>
                              <h3 className="text-lg font-medium hover:text-interview-primary">{job.title}</h3>
                            </Link>
                            <button 
                              className="text-gray-400 hover:text-interview-primary mt-2 sm:mt-0"
                              onClick={() => toggleSaveJob(job.id)}
                              aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                            >
                              {savedJobs.includes(job.id) ? (
                                <BookmarkCheck className="h-5 w-5" />
                              ) : (
                                <Bookmark className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{job.company}</p>
                          
                          <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 mb-4">
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
                          </div>
                          
                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {job.description}
                          </p>
                          
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <Link to={`/jobs/${job.id}`} className="w-full sm:w-auto">
                              <Button className="w-full sm:w-auto">View Details</Button>
                            </Link>
                            
                            {!isRecruiter && (
                              <Link to={`/jobs/${job.id}`} className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:w-auto">Quick Apply</Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;
