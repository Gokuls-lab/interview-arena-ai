// This is a mock API service that simulates backend interactions
// In a real application, these functions would make actual API calls
import Data from '@/services/fetchdata';

// Mock data for jobs
const mockJobs1 = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Tech Solutions Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    description: "We are looking for an experienced Frontend Developer to join our team. The ideal candidate should have strong experience with React, JavaScript, and modern frontend technologies.",
    requirements: [
      "5+ years of experience in frontend development",
      "Strong proficiency in JavaScript, HTML, CSS",
      "Experience with React.js and its ecosystem",
      "Familiarity with RESTful APIs and modern frontend build pipelines",
      "Bachelor's degree in Computer Science or related field"
    ],
    postedBy: 1,
    postedDate: "2023-04-01"
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Digital Innovations",
    location: "Remote",
    type: "Full-time",
    salary: "$100,000 - $130,000",
    description: "Digital Innovations is seeking a Full Stack Developer to help build and maintain our web applications. You'll work on both frontend and backend aspects of our products.",
    requirements: [
      "3+ years of full stack development experience",
      "Proficiency in JavaScript/TypeScript, React, Node.js",
      "Experience with database design and SQL",
      "Understanding of server-side rendering and state management",
      "Good problem-solving skills and attention to detail"
    ],
    postedBy: 1,
    postedDate: "2023-04-05"
  },
  {
    id: 3,
    title: "UX/UI Designer",
    company: "Creative Works",
    location: "New York, NY",
    type: "Full-time",
    salary: "$90,000 - $110,000",
    description: "Creative Works is looking for a talented UX/UI Designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design, possess superior UI skills and be able to translate high-level requirements into interaction flows and artifacts.",
    requirements: [
      "3+ years of UX/UI design experience",
      "Proficiency in design tools like Figma, Sketch, Adobe XD",
      "Portfolio of design projects",
      "Understanding of user-centered design principles",
      "Excellent communication and collaboration skills"
    ],
    postedBy: 1,
    postedDate: "2023-04-10"
  }
];

const mockJobs=await Data.fetchJobData();

// Mock data for applications
let mockApplications = [
  {
    id: 1,
    jobId: 1,
    userId: 2,
    status: "applied",
    applicationDate: "2023-04-15",
    interviewStatus: null,
    interviewDate: null
  }
];

// Mock data for interviews
let mockInterviews = [
  {
    id: 1,
    jobId: 1,
    applicationId: 1,
    candidateId: 2,
    scheduledDate: "2023-05-01T10:00:00Z",
    status: "scheduled",
    feedback: null,
    recordingUrl: null,
    chatHistory: []
  }
];

// Mock delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API service
const API = {
  // Auth endpoints
  auth: {
    // These are handled in the AuthContext
  },
  
  // Jobs endpoints
  jobs: {
    getAll: async () => {
      await delay(800);
      return [...mockJobs];
    },
    
    getById: async (id) => {
      await delay(500);
      const job = mockJobs.find(job => job.id === id);
      if (!job) throw new Error("Job not found");
      return { ...job };
    },
    
    create: async (jobData) => {
      await delay(1000);
      const newJob = {
        id: mockJobs.length + 1,
        ...jobData,
        postedDate: new Date().toISOString().split('T')[0]
      };
      mockJobs.push(newJob);
      return newJob;
    },

    update: async (id, jobData) => {
      await delay(1000);
      const index = mockJobs.findIndex(job => job.id === id);
      if (index === -1) throw new Error("Job not found");
      
      mockJobs[index] = { ...mockJobs[index], ...jobData };
      return mockJobs[index];
    },

    delete: async (id) => {
      await delay(800);
      const index = mockJobs.findIndex(job => job.id === id);
      if (index === -1) throw new Error("Job not found");
      
      mockJobs.splice(index, 1);
      return { success: true };
    }
  },
  
  // Applications endpoints
  applications: {
    getAll: async (userId) => {
      await delay(800);
      if (userId) {
        return mockApplications.filter(app => app.userId === userId);
      }
      return [...mockApplications];
    },
    
    getByJob: async (jobId) => {
      await delay(500);
      return mockApplications.filter(app => app.jobId === jobId);
    },
    
    getById: async (id) => {
      await delay(500);
      const application = mockApplications.find(app => app.id === id);
      if (!application) throw new Error("Application not found");
      return { ...application };
    },
    
    create: async (applicationData) => {
      await delay(1000);
      const newApplication = {
        id: mockApplications.length + 1,
        ...applicationData,
        status: "applied",
        applicationDate: new Date().toISOString().split('T')[0]
      };
      mockApplications.push(newApplication);
      return newApplication;
    },

    updateStatus: async (id, status) => {
      await delay(800);
      const index = mockApplications.findIndex(app => app.id === id);
      if (index === -1) throw new Error("Application not found");
      
      mockApplications[index] = { 
        ...mockApplications[index], 
        status,
        ...(status === 'interview_scheduled' ? { interviewStatus: 'scheduled' } : {})
      };
      return mockApplications[index];
    }
  },
  
  // Interviews endpoints
  interviews: {
    getAll: async (userId, role) => {
      await delay(800);
      if (role === 'jobseeker') {
        return mockInterviews.filter(interview => interview.candidateId === userId);
      }
      // For recruiters, we'd need to join with jobs table in a real app
      return [...mockInterviews];
    },
    
    getById: async (id) => {
      await delay(500);
      const interview = mockInterviews.find(interview => interview.id === id);
      if (!interview) throw new Error("Interview not found");
      return { ...interview };
    },
    
    schedule: async (interviewData) => {
      await delay(1000);
      const newInterview = {
        id: mockInterviews.length + 1,
        ...interviewData,
        status: "scheduled",
        chatHistory: []
      };
      mockInterviews.push(newInterview);
      
      // Update application status
      const applicationIndex = mockApplications.findIndex(app => app.id === interviewData.applicationId);
      if (applicationIndex !== -1) {
        mockApplications[applicationIndex].interviewStatus = "scheduled";
        mockApplications[applicationIndex].interviewDate = interviewData.scheduledDate;
      }
      
      return newInterview;
    },

    updateStatus: async (id, status, data = {}) => {
      await delay(800);
      const index = mockInterviews.findIndex(interview => interview.id === id);
      if (index === -1) throw new Error("Interview not found");
      
      mockInterviews[index] = { 
        ...mockInterviews[index], 
        status,
        ...data
      };
      return mockInterviews[index];
    },

    saveChatHistory: async (id, messages) => {
      await delay(500);
      const index = mockInterviews.findIndex(interview => interview.id === id);
      if (index === -1) throw new Error("Interview not found");
      
      // Ensure we're not mutating the original messages array
      mockInterviews[index].chatHistory = [...messages];
      return { ...mockInterviews[index] };
    },

    saveRecording: async (id, recordingUrl) => {
      await delay(1000);
      const index = mockInterviews.findIndex(interview => interview.id === id);
      if (index === -1) throw new Error("Interview not found");
      
      mockInterviews[index].recordingUrl = recordingUrl;
      return mockInterviews[index];
    }
  },
  
  // Mock interview endpoints
  mockInterview: {
    start: async (role) => {
      await delay(500);
      return {
        id: `mock-${Date.now()}`,
        role,
        startTime: new Date().toISOString()
      };
    },
    
    end: async (id, data) => {
      await delay(1000);
      return {
        id,
        endTime: new Date().toISOString(),
        feedback: data.feedback || "Great job! You demonstrated solid technical knowledge and communication skills.",
        score: data.score || Math.floor(Math.random() * 31) + 70 // Random score between 70-100
      };
    }
  },

  // Profile endpoints
  profile: {
    update: async (userId, profileData) => {
      await delay(1000);
      // In a real app, this would update the user profile in the database
      return {
        id: userId,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
    },
    
    uploadResume: async (userId, file) => {
      await delay(1500);
      // In a real app, this would upload the resume to storage
      return {
        userId,
        resumeUrl: `https://example.com/resumes/${userId}-${file.name}`,
        uploadedAt: new Date().toISOString()
      };
    }
  }
};

export default API;
