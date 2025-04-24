import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Phone, 
  Settings, 
  MessageSquare,
  X,
  Send,
  User,
  Bot,
  Info,
  Copy,
  Check,
  Clock,
  Loader2,
  Minimize,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/services/api';
import videoRecorder from '@/services/videoService';
import speechService from '@/services/speechService';
import aiInterviewService from '@/services/aiService';

const Interview = () => {
  const { id } = useParams();
  const { currentUser, isRecruiter, isJobSeeker } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isEndingInterview, setIsEndingInterview] = useState(false);
  
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const loadInterviewData = async () => {
      setIsLoading(true);
      try {
        // Load job details
        const jobData = await API.jobs.getById(id);
        setJob(jobData);
        
        // Find interview for this job
        const interviewsData = await API.interviews.getAll(currentUser?.id, isRecruiter ? 'recruiter' : 'jobseeker');
        const foundInterview = interviewsData.find(interview => interview.jobId === parseInt(id));
        
        if (foundInterview) {
          setInterview(foundInterview);
          
          // Load existing chat history if any
          if (foundInterview.chatHistory && foundInterview.chatHistory.length > 0) {
            setMessages(foundInterview.chatHistory);
          } else {
            // Initialize with system message
            setMessages([
              {
                role: 'system',
                content: `Welcome to your interview for the ${jobData.title} position at ${jobData.company}. I'll be asking you questions related to this role. Please respond as you would in a real interview.`
              }
            ]);
          }
        } else {
          // Create new interview for demo purposes
          const newInterview = {
            id: Date.now(),
            jobId: parseInt(id),
            candidateId: isJobSeeker ? currentUser.id : 2, // Default user ID for job seeker
            scheduledDate: new Date().toISOString(),
            status: 'in_progress',
            chatHistory: []
          };
          setInterview(newInterview);
          
          // Initialize with system message
          setMessages([
            {
              role: 'system',
              content: `Welcome to your interview for the ${jobData.title} position at ${jobData.company}. I'll be asking you questions related to this role. Please respond as you would in a real interview.`
            }
          ]);
          
          // Save the new interview
          await API.interviews.schedule(newInterview);
        }
      } catch (error) {
        console.error('Error loading interview data:', error);
        toast.error('Failed to load interview data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInterviewData();
    
    // Start timer
    timerRef.current = setInterval(() => {
      setInterviewTime(prev => prev + 1);
    }, 1000);
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id, currentUser, isRecruiter, isJobSeeker]);
  
  // Start media when loaded
  useEffect(() => {
    if (!isLoading && interview) {
      startMedia();
      
      // If no messages or only system message, start with AI greeting
      if (messages.length <= 1) {
        const startInterview = async () => {
          setIsProcessing(true);
          try {
            const aiResponse = {
              role: 'assistant',
              content: `Hello! I'm the AI interviewer for the ${job.title} position at ${job.company}. Let's get started. Could you please introduce yourself and tell me about your background and experience?`
            };
            
            setMessages(prev => [...prev, aiResponse]);
            
            // Save the chat history
            await API.interviews.saveChatHistory(interview.id, [...messages, aiResponse]);
          } catch (error) {
            console.error('Error starting interview:', error);
          } finally {
            setIsProcessing(false);
          }
        };
        
        startInterview();
      }
    }
    
    return () => {
      stopMedia();
    };
  }, [isLoading, interview, job]);
  
  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const startMedia = async () => {
    try {
      if (isVideoEnabled) {
        const stream = await videoRecorder.startRecording();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsRecording(true);
        toast.success("Recording started");
      }
    } catch (error) {
      console.error('Error starting media:', error);
      toast.error("Failed to access camera or microphone");
    }
  };
  
  const stopMedia = async () => {
    if (isRecording) {
      try {
        const recordingData = await videoRecorder.stopRecording();
        console.log('Recording stopped, size:', recordingData.size);
        setIsRecording(false);
        
        // In a real app, upload the recording
        if (interview) {
          await API.interviews.saveRecording(interview.id, recordingData.base64);
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  };
  
  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In a real implementation, this would mute/unmute the audio track
  };
  
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (isVideoEnabled && isRecording) {
      stopMedia();
    } else if (!isVideoEnabled && interview) {
      startMedia();
    }
  };
  
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    setIsProcessing(true);
    const messageToSend = inputMessage;
    setInputMessage(''); // Clear input early to prevent double sends
    
    try {
      // Add user message to chat
      const userMessage = {
        role: 'user',
        content: messageToSend
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Save chat history
      await API.interviews.saveChatHistory(interview.id, updatedMessages);
      
      // Process the message with AI service
      await processResponse(messageToSend);
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to process your response');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const processResponse = async (userInput) => {
    try {
      // In a real app, this would use the Gemini API
      // For demo, we'll simulate a response from aiInterviewService
      
      // Check if we should end the interview (function calling simulation)
      const shouldEnd = aiInterviewService.shouldEndInterview();
      
      let aiResponse;
      
      if (shouldEnd) {
        aiResponse = {
          role: 'assistant',
          content: "Thank you for your time today. I think we've covered all the key areas I wanted to discuss. Do you have any questions for me about the role or the company?"
        };
      } else {
        // Get a simulated response - don't create a new session
        const response = await aiInterviewService.processResponse(userInput);
        
        aiResponse = {
          role: 'assistant',
          content: response.text
        };
        
        // If the response indicates the interview should end
        if (response.type === 'end') {
          setTimeout(() => {
            setShowEndDialog(true);
          }, 3000);
        }
      }
      
      // Add the AI response to messages while preserving previous messages
      const updatedMessages = [...messages, aiResponse];
      setMessages(updatedMessages);
      
      // Save chat history
      await API.interviews.saveChatHistory(interview.id, updatedMessages);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate response');
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      
      // Process the transcript
      if (transcript.trim()) {
        setInputMessage(transcript);
      }
    } else {
      const success = speechService.startListening({
        onTranscriptUpdate: (finalText, interimText) => {
          setTranscript(finalText);
        },
        onSpeechEnd: (finalText) => {
          setTranscript(finalText);
          setIsListening(false);
        }
      });
      
      if (success) {
        setIsListening(true);
        toast.success('Listening...');
      } else {
        toast.error('Speech recognition not supported or permission denied');
      }
    }
  };
  
  const handleEndInterview = async () => {
    setIsEndingInterview(true);
    
    try {
      // Stop media recording
      await stopMedia();
      
      // Update interview status
      await API.interviews.updateStatus(interview.id, 'completed');
      
      // Save final chat history
      await API.interviews.saveChatHistory(interview.id, messages);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success('Interview completed successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error ending interview:', error);
      toast.error('Failed to end interview properly');
    } finally {
      setIsEndingInterview(false);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-interview-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading interview...</p>
        </div>
      </div>
    );
  }
  
  if (!job || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Interview Not Found</h1>
          <p className="text-gray-500 mb-6">The interview you're looking for doesn't exist or has been canceled.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef} 
      className="flex flex-col h-screen bg-gray-100"
    >
      <div className="bg-white shadow-sm py-2 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="text-gray-700 hover:text-gray-900"
            onClick={() => {
              if (confirm('Are you sure you want to leave the interview? Your progress will be saved.')) {
                stopMedia();
                navigate('/dashboard');
              }
            }}
          >
            <X className="h-5 w-5" />
          </button>
          <h1 className="ml-4 font-medium">{job.title} Interview</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatTime(interviewTime)}</span>
          </div>
          
          {isRecording && (
            <div className="recording-indicator flex items-center text-red-500 text-sm">
              Recording
            </div>
          )}
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setShowEndDialog(true)}
            disabled={isEndingInterview}
          >
            {isEndingInterview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4 mr-1" />}
            End Interview
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Video Panel */}
        <div className="w-1/3 bg-gray-900 flex flex-col">
          <div className="flex-1 p-4 flex items-center justify-center">
            {isVideoEnabled ? (
              <video
                ref={videoRef}
                className="w-full aspect-video rounded-lg object-cover shadow-lg"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <VideoOff className="h-12 w-12 mb-2" />
                <p>Camera is turned off</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-800 flex justify-center space-x-3">
            <Button 
              variant={isAudioEnabled ? "default" : "outline"}
              size="sm"
              className={`rounded-full w-10 h-10 p-0 ${isAudioEnabled ? 'bg-white text-gray-900' : 'bg-gray-700 text-white'}`}
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant={isVideoEnabled ? "default" : "outline"}
              size="sm"
              className={`rounded-full w-10 h-10 p-0 ${isVideoEnabled ? 'bg-white text-gray-900' : 'bg-gray-700 text-white'}`}
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10 p-0 bg-gray-700 text-white"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col bg-white border-l">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  rounded-lg p-4 max-w-[80%] 
                  ${message.role === 'user' 
                    ? 'bg-interview-primary text-white' 
                    : message.role === 'system' 
                      ? 'bg-gray-200 text-gray-800 w-full' 
                      : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  {message.role !== 'system' && (
                    <div className="flex items-center mb-1">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 mr-1" />
                      ) : (
                        <Bot className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-xs font-medium">
                        {message.role === 'user' ? 'You' : 'AI Interviewer'}
                      </span>
                    </div>
                  )}
                  <p className={`${message.role === 'system' ? 'text-sm italic' : ''}`}>{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full ${isListening ? 'bg-red-100 text-red-500 border-red-200' : ''}`}
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Input
                placeholder="Type your response..."
                value={isListening ? transcript : inputMessage}
                onChange={handleInputChange}
                disabled={isListening || isProcessing}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              
              <Button
                type="submit"
                size="icon"
                disabled={(!inputMessage.trim() && !transcript.trim()) || isProcessing}
                onClick={handleSendMessage}
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
            
            {isListening && (
              <div className="mt-2 text-sm text-gray-500 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                Listening... {transcript ? `"${transcript}"` : 'Say something'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* End Interview Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this interview?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800 flex items-start">
              <Info className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
              <p>Once ended, the interview recording and chat transcript will be saved. This cannot be undone.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleEndInterview}
              disabled={isEndingInterview}
            >
              {isEndingInterview ? 'Ending...' : 'End Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interview;
