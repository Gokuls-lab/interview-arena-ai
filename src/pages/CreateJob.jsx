
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Check, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/services/api';

const CreateJob = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    company: currentUser?.company || '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: ['', ''],
    postedBy: currentUser?.id,
    postedDate: new Date().toISOString().split('T')[0]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleRequirementChange = (index, value) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements[index] = value;
    
    setFormData(prev => ({
      ...prev,
      requirements: updatedRequirements
    }));
  };
  
  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };
  
  const removeRequirement = (index) => {
    if (formData.requirements.length <= 1) return;
    
    const updatedRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      requirements: updatedRequirements
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.type.trim()) newErrors.type = 'Job type is required';
    if (!formData.salary.trim()) newErrors.salary = 'Salary range is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    
    const filteredRequirements = formData.requirements.filter(req => req.trim());
    if (filteredRequirements.length === 0) {
      newErrors.requirements = 'At least one job requirement is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Clean up requirements array to remove empty items
      const cleanedFormData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim())
      };
      
      const newJob = await API.jobs.create(cleanedFormData);
      
      toast.success('Job posted successfully!');
      navigate(`/jobs/${newJob.id}`);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post a New Job</h1>
          <p className="text-gray-600 mt-1">
            Create a job listing to find the perfect candidate
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the essential details about the position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Senior Frontend Developer"
                    value={formData.title}
                    onChange={handleChange}
                    className={errors.title ? 'border-red-300' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Your company name"
                    value={formData.company}
                    onChange={handleChange}
                    className={errors.company ? 'border-red-300' : ''}
                  />
                  {errors.company && (
                    <p className="text-sm text-red-500">{errors.company}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g. San Francisco, CA or Remote"
                      value={formData.location}
                      onChange={handleChange}
                      className={errors.location ? 'border-red-300' : ''}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Job Type <span className="text-red-500">*</span></Label>
                    <Select 
                      name="type" 
                      value={formData.type} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, type: value }));
                        if (errors.type) {
                          setErrors(prev => ({ ...prev, type: '' }));
                        }
                      }}
                    >
                      <SelectTrigger id="type" className={errors.type ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-500">{errors.type}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range <span className="text-red-500">*</span></Label>
                  <Input
                    id="salary"
                    name="salary"
                    placeholder="e.g. $80,000 - $100,000"
                    value={formData.salary}
                    onChange={handleChange}
                    className={errors.salary ? 'border-red-300' : ''}
                  />
                  {errors.salary && (
                    <p className="text-sm text-red-500">{errors.salary}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Provide detailed information about the role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the role, responsibilities, and ideal candidate..."
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    className={errors.description ? 'border-red-300' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Requirements <span className="text-red-500">*</span></Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addRequirement}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {errors.requirements && (
                    <p className="text-sm text-red-500">{errors.requirements}</p>
                  )}
                  
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Requirement ${index + 1}`}
                        value={req}
                        onChange={(e) => handleRequirementChange(index, e.target.value)}
                        className={errors.requirements ? 'border-red-300' : ''}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeRequirement(index)}
                        disabled={formData.requirements.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>
                  Make sure all information is correct before posting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Once posted, your job listing will be visible to all users of the platform.
                    Make sure all the information is accurate.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-1"
                >
                  {isSubmitting ? (
                    <>Posting...</>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4 mr-1" />
                      Post Job
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
