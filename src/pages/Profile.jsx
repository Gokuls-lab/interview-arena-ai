
import { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText, 
  Award, 
  Trash2, 
  Plus,
  Upload,
  Pencil,
  Github,
  Linkedin,
  Globe,
  Save,
  Check,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/services/api';

const Profile = () => {
  const { currentUser, updateProfile, isRecruiter, isJobSeeker } = useAuth();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    bio: currentUser?.bio || '',
    title: currentUser?.title || '',
    company: currentUser?.company || '',
    website: currentUser?.website || '',
    github: currentUser?.github || '',
    linkedin: currentUser?.linkedin || '',
    skills: currentUser?.skills || [],
    education: currentUser?.education || [
      { school: '', degree: '', field: '', startYear: '', endYear: '' }
    ],
    experience: currentUser?.experience || [
      { company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' }
    ],
    resumeUrl: currentUser?.resumeUrl || ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSkillChange = (e) => {
    const skillsString = e.target.value;
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
    setProfileData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };
  
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...profileData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    setProfileData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };
  
  const addEducation = () => {
    setProfileData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { school: '', degree: '', field: '', startYear: '', endYear: '' }
      ]
    }));
  };
  
  const removeEducation = (index) => {
    if (profileData.education.length <= 1) return;
    
    const updatedEducation = profileData.education.filter((_, i) => i !== index);
    setProfileData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };
  
  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...profileData.experience];
    
    if (field === 'current') {
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value,
        endDate: value ? '' : updatedExperience[index].endDate
      };
    } else {
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value
      };
    }
    
    setProfileData(prev => ({
      ...prev,
      experience: updatedExperience
    }));
  };
  
  const addExperience = () => {
    setProfileData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' }
      ]
    }));
  };
  
  const removeExperience = (index) => {
    if (profileData.experience.length <= 1) return;
    
    const updatedExperience = profileData.experience.filter((_, i) => i !== index);
    setProfileData(prev => ({
      ...prev,
      experience: updatedExperience
    }));
  };
  
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    // In a real app, this would upload to a server
    // For demo purposes, we'll just set a fake URL
    const fakeUrl = URL.createObjectURL(file);
    setProfileData(prev => ({
      ...prev,
      resumeUrl: fakeUrl
    }));
    
    toast.success('Resume uploaded successfully');
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, this would send data to a server
      await updateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-gray-600 mt-1">
              Manage your personal information and career details
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Profile Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-interview-light rounded-full flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-interview-primary" />
                  </div>
                  
                  <h2 className="text-xl font-bold">{profileData.name}</h2>
                  <p className="text-gray-600">{profileData.title || (isRecruiter ? 'Recruiter' : 'Job Seeker')}</p>
                  
                  {profileData.company && (
                    <div className="flex items-center mt-1 text-gray-600">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{profileData.company}</span>
                    </div>
                  )}
                  
                  {profileData.location && (
                    <div className="flex items-center mt-1 text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-3" />
                    <span>{profileData.email}</span>
                  </div>
                  
                  {profileData.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-3" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                </div>
                
                {/* Social Links */}
                {(profileData.website || profileData.linkedin || profileData.github) && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-medium mb-3">Connect</h3>
                    <div className="space-y-3">
                      {profileData.website && (
                        <a 
                          href={profileData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-interview-primary hover:text-interview-secondary"
                        >
                          <Globe className="h-5 w-5 mr-3" />
                          <span>Website</span>
                        </a>
                      )}
                      
                      {profileData.linkedin && (
                        <a 
                          href={profileData.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-interview-primary hover:text-interview-secondary"
                        >
                          <Linkedin className="h-5 w-5 mr-3" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      
                      {profileData.github && (
                        <a 
                          href={profileData.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-interview-primary hover:text-interview-secondary"
                        >
                          <Github className="h-5 w-5 mr-3" />
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Resume */}
                {isJobSeeker && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Resume</h3>
                      {!isEditing && (
                        <Button variant="ghost" size="sm" onClick={triggerFileInput}>
                          <Upload className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleResumeUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />
                    
                    {profileData.resumeUrl ? (
                      <div className="flex items-center bg-gray-50 p-3 rounded-md">
                        <FileText className="h-6 w-6 text-interview-primary mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">Resume.pdf</p>
                          <p className="text-xs text-gray-500">Uploaded on Apr 9, 2023</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-md text-center">
                        <p className="text-sm text-gray-500">
                          No resume uploaded yet.
                        </p>
                        {isEditing && (
                          <Button variant="ghost" size="sm" onClick={triggerFileInput} className="mt-2">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Resume
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Skills */}
                {isJobSeeker && profileData.skills.length > 0 && !isEditing && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-medium mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-interview-light text-interview-primary px-2 py-1 rounded-md text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="City, State, Country"
                        value={profileData.location}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Tell us about yourself"
                        rows={4}
                        value={profileData.bio}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Professional Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g. Software Engineer"
                        value={profileData.title}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Your current company"
                        value={profileData.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="font-medium mb-3">Online Presence</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          placeholder="https://yourwebsite.com"
                          value={profileData.website}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          name="linkedin"
                          placeholder="https://linkedin.com/in/yourusername"
                          value={profileData.linkedin}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          name="github"
                          placeholder="https://github.com/yourusername"
                          value={profileData.github}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {isJobSeeker && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-medium mb-3">Skills</h3>
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Textarea
                          id="skills"
                          placeholder="e.g. JavaScript, React, Node.js"
                          value={profileData.skills.join(', ')}
                          onChange={handleSkillChange}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                  
                  {isJobSeeker && (
                    <>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Education</h3>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={addEducation}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        
                        <div className="space-y-6">
                          {profileData.education.map((edu, index) => (
                            <div key={index} className="space-y-4 pb-4 border-b border-gray-100 last:border-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Education #{index + 1}</h4>
                                {profileData.education.length > 1 && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeEducation(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-gray-500" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`edu-school-${index}`}>School/University</Label>
                                  <Input
                                    id={`edu-school-${index}`}
                                    value={edu.school}
                                    onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                                  <Select 
                                    value={edu.degree}
                                    onValueChange={(value) => handleEducationChange(index, 'degree', value)}
                                  >
                                    <SelectTrigger id={`edu-degree-${index}`}>
                                      <SelectValue placeholder="Select degree" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                                      <SelectItem value="Master's">Master's</SelectItem>
                                      <SelectItem value="PhD">PhD</SelectItem>
                                      <SelectItem value="Associate">Associate</SelectItem>
                                      <SelectItem value="High School">High School</SelectItem>
                                      <SelectItem value="Certificate">Certificate</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`edu-field-${index}`}>Field of Study</Label>
                                  <Input
                                    id={`edu-field-${index}`}
                                    value={edu.field}
                                    onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-2">
                                    <Label htmlFor={`edu-start-${index}`}>Start Year</Label>
                                    <Input
                                      id={`edu-start-${index}`}
                                      type="number"
                                      min="1900"
                                      max="2099"
                                      value={edu.startYear}
                                      onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`edu-end-${index}`}>End Year</Label>
                                    <Input
                                      id={`edu-end-${index}`}
                                      type="number"
                                      min="1900"
                                      max="2099"
                                      value={edu.endYear}
                                      onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Work Experience</h3>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={addExperience}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        
                        <div className="space-y-6">
                          {profileData.experience.map((exp, index) => (
                            <div key={index} className="space-y-4 pb-4 border-b border-gray-100 last:border-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Experience #{index + 1}</h4>
                                {profileData.experience.length > 1 && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeExperience(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-gray-500" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`exp-title-${index}`}>Job Title</Label>
                                  <Input
                                    id={`exp-title-${index}`}
                                    value={exp.title}
                                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`exp-company-${index}`}>Company</Label>
                                  <Input
                                    id={`exp-company-${index}`}
                                    value={exp.company}
                                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`exp-location-${index}`}>Location</Label>
                                  <Input
                                    id={`exp-location-${index}`}
                                    value={exp.location}
                                    onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-2">
                                    <Label htmlFor={`exp-start-${index}`}>Start Date</Label>
                                    <Input
                                      id={`exp-start-${index}`}
                                      type="month"
                                      value={exp.startDate}
                                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`exp-end-${index}`}>End Date</Label>
                                    <Input
                                      id={`exp-end-${index}`}
                                      type="month"
                                      value={exp.endDate}
                                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                      disabled={exp.current}
                                    />
                                  </div>
                                </div>
                                
                                <div className="md:col-span-2 flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`exp-current-${index}`}
                                    checked={exp.current}
                                    onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                                    className="mr-2"
                                  />
                                  <Label htmlFor={`exp-current-${index}`}>I currently work here</Label>
                                </div>
                                
                                <div className="md:col-span-2 space-y-2">
                                  <Label htmlFor={`exp-description-${index}`}>Description</Label>
                                  <Textarea
                                    id={`exp-description-${index}`}
                                    value={exp.description}
                                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profileData.bio ? (
                      <p>{profileData.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic">
                        No bio provided. Click 'Edit Profile' to add information about yourself.
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Experience & Education Tabs */}
                {isJobSeeker && (
                  <Tabs defaultValue="experience">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="experience">Experience</TabsTrigger>
                      <TabsTrigger value="education">Education</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="experience" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Work Experience</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {profileData.experience.length === 0 || 
                           (profileData.experience.length === 1 && !profileData.experience[0].company) ? (
                            <div className="text-center py-6">
                              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <h3 className="text-lg font-medium mb-1">No experience added yet</h3>
                              <p className="text-gray-500 mb-4">
                                Add your work history to help employers understand your background.
                              </p>
                              <Button variant="outline" onClick={() => setIsEditing(true)}>
                                Add Experience
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {profileData.experience
                                .filter(exp => exp.company && exp.title)
                                .map((exp, index) => (
                                <div key={index} className="relative pl-6 pb-6 border-l border-gray-200 last:pb-0">
                                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-interview-primary"></div>
                                  
                                  <div className="mb-1">
                                    <h3 className="font-medium">{exp.title}</h3>
                                    <div className="text-gray-600">
                                      {exp.company}
                                      {exp.location && ` · ${exp.location}`}
                                    </div>
                                  </div>
                                  
                                  <div className="text-sm text-gray-500 mb-2">
                                    {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                    {' - '}
                                    {exp.current ? 
                                      'Present' : 
                                      (exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }))
                                    }
                                  </div>
                                  
                                  {exp.description && (
                                    <p className="text-gray-700">{exp.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="education" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Education</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {profileData.education.length === 0 || 
                           (profileData.education.length === 1 && !profileData.education[0].school) ? (
                            <div className="text-center py-6">
                              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <h3 className="text-lg font-medium mb-1">No education added yet</h3>
                              <p className="text-gray-500 mb-4">
                                Add your educational background to showcase your qualifications.
                              </p>
                              <Button variant="outline" onClick={() => setIsEditing(true)}>
                                Add Education
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {profileData.education
                                .filter(edu => edu.school)
                                .map((edu, index) => (
                                <div key={index} className="relative pl-6 pb-6 border-l border-gray-200 last:pb-0">
                                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-interview-primary"></div>
                                  
                                  <div className="mb-1">
                                    <h3 className="font-medium">{edu.school}</h3>
                                    <div className="text-gray-600">
                                      {edu.degree}{edu.field && `, ${edu.field}`}
                                    </div>
                                  </div>
                                  
                                  <div className="text-sm text-gray-500">
                                    {edu.startYear} - {edu.endYear || 'Present'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
                
                {/* Interview History */}
                {isJobSeeker && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start border-b border-gray-100 pb-4">
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
                              <div className="flex items-center text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-gray-600">Score: 85/100</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-interview-light p-2 rounded-lg mr-4">
                            <Video className="h-6 w-6 text-interview-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">Senior Frontend Developer</h3>
                              <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">Upcoming</span>
                            </div>
                            <p className="text-sm text-gray-500">Tech Solutions Inc. • Tomorrow, 10:00 AM</p>
                            <div className="mt-2">
                              <Button variant="outline" size="sm">
                                Join Interview
                              </Button>
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
                
                {/* Job Listings (for Recruiters) */}
                {isRecruiter && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Your Job Listings</CardTitle>
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start border-b border-gray-100 pb-4">
                          <div className="bg-interview-light p-2 rounded-lg mr-4">
                            <Briefcase className="h-6 w-6 text-interview-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">Senior Frontend Developer</h3>
                              <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">Active</span>
                            </div>
                            <p className="text-sm text-gray-500">Posted on April 1, 2023 • 12 applicants</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start border-b border-gray-100 pb-4">
                          <div className="bg-interview-light p-2 rounded-lg mr-4">
                            <Briefcase className="h-6 w-6 text-interview-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">Full Stack Developer</h3>
                              <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">Active</span>
                            </div>
                            <p className="text-sm text-gray-500">Posted on April 5, 2023 • 8 applicants</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-interview-light p-2 rounded-lg mr-4">
                            <Briefcase className="h-6 w-6 text-interview-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">UX/UI Designer</h3>
                              <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">Active</span>
                            </div>
                            <p className="text-sm text-gray-500">Posted on April 10, 2023 • 5 applicants</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Post New Job</Button>
                    </CardFooter>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
