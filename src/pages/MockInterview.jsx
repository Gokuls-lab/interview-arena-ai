
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Phone, 
  Settings, 
  MessageSquare,
  X,
  ThumbsUp,
  ThumbsDown,
  Send,
  User,
  Bot,
  Info,
  AlertTriangle,
  Clock,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import videoRecorder from '@/services/videoService';
import speechService from '@/services/speechService';
import aiInterviewService from '@/services/aiService';

const roles = [
  { id: 'software-developer', name: 'Software Developer' },
  { id: 'data-scientist', name: 'Data Scientist' },
  { id: 'product-manager', name: 'Product Manager' },
  { id: 'marketing', name: 'Marketing Professional' }
];

const MockInterview = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState('setup'); // setup, prepare, interview, results
  const [selectedRole, setSelectedRole] = useState('software-developer');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const [results, setResults] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  // Setup video and audio streams
  useEffect(() => {
    if (stage === 'interview') {
      startMedia();
      
      // Start timer
      timerRef.current = setInterval(() => {
        setInterviewTime(prev => prev + 1);
      }, 1000);
      
      return () => {
        stopMedia();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [stage]);

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
    } else if (!isVideoEnabled && stage === 'interview') {
      startMedia();
    }
  };

  const startInterview = async () => {
    setIsProcessing(true);
    
    try {
      // Start a new interview session with the AI
      const session = await aiInterviewService.startSession(selectedRole);
      setSessionId(session.sessionId);
      
      // Add the first question to messages
      setMessages([
        {
          role: 'system',
          content: 'Welcome to your mock interview. I will ask you a series of questions related to your selected role. Please respond as you would in a real interview. When we\'re done, I\'ll provide feedback on your performance.'
        },
        {
          role: 'assistant',
          content: session.firstQuestion
        }
      ]);
      
      // Move to interview stage
      setStage('interview');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start the interview. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const endInterview = async () => {
    setIsProcessing(true);
    
    try {
      // Stop recording
      await stopMedia();
      
      // Process final response if needed
      if (sessionId && transcript.trim()) {
        await processResponse(transcript);
        setTranscript('');
      }
      
      // Get the final result from the AI service
      const result = await aiInterviewService.endInterview();
      setResults(result);
      
      // Move to results stage
      setStage('results');
    } catch (error) {
      console.error('Error ending interview:', error);
      toast.error('Failed to end the interview properly.');
    } finally {
      setIsProcessing(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
      
      // Process the response
      await processResponse(inputMessage);
      
      // Clear input
      setInputMessage('');
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to process your response.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processResponse = async (response) => {
    // Send user's response to AI service
    const aiResponse = await aiInterviewService.processResponse(response);
    
    // Add AI's response to messages
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse.text }]);
    
    // Check if interview should end
    if (aiResponse.type === 'end') {
      setResults(aiResponse);
      await stopMedia();
      setStage('results');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderSetupStage = () => (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mock Interview Setup</CardTitle>
          <CardDescription>Practice your interview skills with AI feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="role-select">Select Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              The AI interviewer will ask relevant questions for this role.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label>Interview Format</Label>
            <RadioGroup defaultValue="video">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" checked />
                <Label htmlFor="video">Video Interview (recommended)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="audio" id="audio" disabled />
                <Label htmlFor="audio" className="text-gray-500">Audio Only (coming soon)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">How it works:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>You'll have a video interview with our AI interviewer</li>
                  <li>Your responses will be analyzed in real-time</li>
                  <li>The interview typically lasts 5-10 minutes</li>
                  <li>You'll receive detailed feedback on your performance</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button onClick={() => setStage('prepare')}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const renderPrepareStage = () => (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Prepare for Your Interview</CardTitle>
          <CardDescription>Make sure everything is set up correctly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {isVideoEnabled ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
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
          
          <div className="flex justify-center space-x-4">
            <Button 
              variant={isAudioEnabled ? "default" : "outline"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button 
              variant={isVideoEnabled ? "default" : "outline"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">Before you begin:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure you're in a quiet environment</li>
                  <li>Check that your camera and microphone are working</li>
                  <li>Prepare as you would for a real interview</li>
                  <li>The recording will be at 1fps to save bandwidth</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setStage('setup')}>
            Back
          </Button>
          <Button onClick={startInterview} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Start Interview
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const renderInterviewStage = () => (
    <div className="flex flex-col h-screen">
      <div className="bg-white shadow-sm py-2 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="text-gray-700 hover:text-gray-900"
            onClick={() => {
              if (confirm('Are you sure you want to leave the interview? Your progress will be lost.')) {
                stopMedia();
                navigate('/dashboard');
              }
            }}
          >
            <X className="h-5 w-5" />
          </button>
          <h1 className="ml-4 font-medium">Mock Interview: {roles.find(r => r.id === selectedRole)?.name}</h1>
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
            onClick={endInterview}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4 mr-1" />}
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
            >
              <Settings className="h-4 w-4" />
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
    </div>
  );

  const renderResultsStage = () => (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Interview Results</h1>
          <p className="text-gray-600">
            Review your performance and feedback from the AI interviewer
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="text-4xl font-bold text-center">{results?.score || 0}</div>
                  <div className="text-sm text-gray-500 text-center">out of 100</div>
                  {results?.score >= 80 && (
                    <div className="absolute -top-2 -right-4">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 text-interview-primary mr-2" />
                <span className="text-2xl font-bold">{formatTime(interviewTime)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Questions Answered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-interview-primary mr-2" />
                <span className="text-2xl font-bold">{results?.sessionSummary?.questionsAsked || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Interview Feedback</CardTitle>
            <CardDescription>AI assessment of your interview performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Overall Assessment</h3>
              <p>{results?.feedback || "No feedback available."}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Strengths</h3>
              <ul className="space-y-2">
                {results?.strengths ? (
                  results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <ThumbsUp className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No specific strengths highlighted.</li>
                )}
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-3">Areas for Improvement</h3>
              <ul className="space-y-2">
                {results?.improvements ? (
                  results.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <ThumbsDown className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No specific improvements suggested.</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Interview Transcript</CardTitle>
            <CardDescription>Review your conversation with the AI interviewer</CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {messages.filter(m => m.role !== 'system').map((message, index) => (
                <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center mb-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center 
                      ${message.role === 'assistant' ? 'bg-interview-light text-interview-primary' : 'bg-gray-200'}
                    `}>
                      {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <span className="ml-2 font-medium">
                      {message.role === 'assistant' ? 'AI Interviewer' : 'You'}
                    </span>
                  </div>
                  <p className="text-gray-700 ml-10">{message.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
            <Button onClick={() => setStage('setup')}>
              Start New Interview
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

  // Render different components based on current stage
  switch (stage) {
    case 'setup':
      return renderSetupStage();
    case 'prepare':
      return renderPrepareStage();
    case 'interview':
      return renderInterviewStage();
    case 'results':
      return renderResultsStage();
    default:
      return renderSetupStage();
  }
};

export default MockInterview;
