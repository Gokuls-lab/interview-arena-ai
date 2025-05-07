import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GoogleGenAI } from "@google/genai";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  ScreenShare,
  Settings,
  MinusCircle,
  MoreVertical,
  Volume2,
  Volume,
  Camera
} from "lucide-react";
import API from '@/services/api';
import { useParams, Link, useNavigate } from 'react-router-dom';


export default function Interview() {
    const { id } = useParams();
  
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(80);

  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const captureIntervalRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [job, setJob] = useState(null);


  const loadJobDetails = async () => {
    setIsLoading(true);
    try {
      const jobData = await API.jobs.getById(id);
      setJob(jobData);
      console.log(jobData)
    } catch (error) {
      console.error('Error loading job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };
  
useEffect(()=>{
  loadJobDetails();

},[])
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyBQgUq_pscmRRw36Y7HKt3dvDTgKTQvUA4"
  });

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  async function startInterview() {
    try {
      setIsInterviewStarted(true);
      await startVideoCapture();
      
      // Add simulated participants
      setParticipants([
        { id: 1, name: "Sarah Chen", role: "HR Manager", avatar: "/api/placeholder/50/50" },
        { id: 2, name: "James Wilson", role: "Tech Lead", avatar: "/api/placeholder/50/50" },
        { id: 3, name: "Michael Lee", role: "CTO", avatar: "/api/placeholder/50/50" }
      ]);
      
      setChatHistory([{
        role: "ai",
        content: "Hello! Welcome to your AI-powered interview. Let's begin with some technical questions. Can you tell me about your experience with React?",
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Could not access camera. Please check permissions.");
      setIsInterviewStarted(false);
    }
  }

  async function endInterview() {
    try {
      setIsLoading(true);
      stopVideoCapture();
      setIsInterviewStarted(false);

      const recordedBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });

      const evaluation = await evaluateCandidate(recordedBlob, chatHistory);
      setEvaluationResult(evaluation);
    } catch (error) {
      console.error("Error in evaluation:", error);
      setEvaluationResult({
        error: true,
        message: error.message,
        rawResponse: error.rawResponse,
        fallbackData: getFallbackEvaluation(error.message)
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function startVideoCapture() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.start();

    captureIntervalRef.current = setInterval(() => {
      mediaRecorderRef.current.requestData();
    }, 1000);
  }

  function stopVideoCapture() {
    clearInterval(captureIntervalRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  }

  function toggleAudio() {
    setAudioMuted(!audioMuted);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = audioMuted;
      });
    }
  }

  function toggleVideo() {
    setVideoMuted(!videoMuted);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = videoMuted;
      });
    }
  }

  async function sendMessage() {
    if (!currentInput.trim()) return;

    const userMessage = {
      role: "user",
      content: currentInput,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prevHistory => [...prevHistory, userMessage]);
    setCurrentInput("");

    try {
      const aiReply = await getAIResponse(currentInput);
      const aiMessage = {
        role: "ai",
        content: aiReply,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prevHistory => [...prevHistory, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
    }
  }

  async function sendMessage1(q) {
    if (!q.trim()) return;

    const userMessage = {
      role: "user",
      content: q,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prevHistory => [...prevHistory, userMessage]);
    setCurrentInput("");

    try {
      const aiReply = await getAIResponse(q);
      const aiMessage = {
        role: "ai",
        content: aiReply,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prevHistory => [...prevHistory, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
    }
  }

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Update the input with interim results for visual feedback
        setCurrentInput(interimTranscript);
        
        // Only send the message when we have a final transcript
        if (finalTranscript) {
          sendMessage1(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle space bar press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' && !isListening) {
        event.preventDefault(); // Prevent default space behavior
        startListening();
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === 'Space' && isListening) {
        event.preventDefault();
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log("Listening started...");
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("Listening stopped.");
      
      // Clear input if no message was sent
      if (currentInput.trim() && !chatHistory.some(msg => 
        msg.role === 'user' && msg.content === currentInput)) {
        setCurrentInput("");
      }
    }
  };  

  function speak(text, options = {}) {
    // Check if the browser supports the SpeechSynthesis API
    if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported in this browser.');
        return;
    }

    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set optional properties
    utterance.rate = options.rate || 1; // Speed (0.1 to 10)
    utterance.pitch = options.pitch || 1; // Pitch (0 to 2)
    utterance.volume = options.volume || 1; // Volume (0 to 1)
    utterance.voice = options.voice || null; // Specific voice

    // Speak the text
    window.speechSynthesis.speak(utterance);
}


const chat = ai.chats.create({
  model: "gemini-2.0-flash",
  // history: [
  //   {
  //     role: "user",
  //     parts: [{ text: "Hello" }],
  //   },
  //   {
  //     role: "model",
  //     parts: [{ text: `Good morning` }],
  //   },
  // ],
  config: {
    systemInstruction: `Interview Structure:
Greeting

make the conversation very smaller like real human !!

Politely greet the candidate

Confirm their name and role they’ve applied for

Behavioral & HR Questions

Evaluate communication skills, problem-solving, and leadership abilities.

Use STAR (Situation, Task, Action, Result) method to probe deeper into responses.

Examples:

"Tell me about yourself."

"Describe a time when you faced a challenge at work and how you handled it."

"What motivates you in a workplace environment?"

"How do you handle criticism and feedback?"

Why do you want to work here?

What are your strengths and weaknesses?

How do you handle conflict or pressure?

Where do you see yourself in 5 years?

Have you ever worked in a team? What was your role?

What do you know about our company?

How would your previous manager describe you?


Job Role-Specific Questions

Ask adaptive questions based on the candidate's profile.

Ensure technical depth and practical application in responses.

Examples:

"Explain a complex project you worked on and your role in it."

"What skills make you a good fit for this position?"

"How do you keep up with the latest industry trends?"

Scenario-Based Questions

Present real-world situations to test problem-solving abilities.

Examples:

"Imagine you are leading a project, and a key member leaves suddenly. How would you handle it?"

"A customer is unhappy with a service/product. What steps would you take to resolve the issue?"

Soft Skills & Cultural Fit

Evaluate adaptability, teamwork, and workplace behavior.

Examples:

"How do you handle workplace conflicts?"

"Describe a time you collaborated with a difficult team member."

"What kind of work environment helps you perform best?"

Confidence & Fluency Assessment

Measure speech clarity, hesitation, tone, and confidence throughout the conversation.

Video-Based Confidence Analysis

Continuously assess the candidate's facial expressions, eye movement, tone, fluency, and confidence.

Note signs of dishonesty, hesitation, or discomfort.

Evaluate presence and body language professionalism.

Final Questions

Do you have any questions for us?

Are you available to start immediately, or do you have a notice period?

Close the Interview

Thank the candidate and inform them that the evaluation report will be sent to the hiring manager.

Evaluation Criteria (in background)
Communication clarity and tone (1–10)

Confidence level from video cues (1–10)

Honesty and consistency (1–10)

Alignment with company culture (1–10)

Potential red flags or suspicious behavior (Yes/No)

Final Verdict: Strong Yes / Yes / Neutral / No

Provide a summary report at the end with:

Candidate name

Key observations

Scorecard

Notable strengths

Areas to improve

Communication Skills (fluency, clarity)

Confidence & Personality

Technical/Domain Knowledge

Problem-Solving Ability

Cultural Fit & Adaptability

Final hiring recommendation

The interview should be strict, professional, and finished in under 15 minutes, without skipping any step.

Job role applied for:
${job}
`,
  }
});

// Company: Amazon
// Role: Full stack developer
  async function getAIResponse(query) {
    const response1 = await chat.sendMessage({
      message: query,
    });
    console.log("Chat response 1:", response1.text);
    speak(response1.text)
    return response1.text;
  }

  async function evaluateCandidate(videoBlob, history) {
    if (videoBlob.size < 10000) throw new Error("Video too short for analysis");

    const videoBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(videoBlob);
    });

    const chatText = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');

    const prompt = `Analyze this technical interview and provide detailed evaluation.
Return ONLY the raw JSON output without any Markdown formatting or additional text.

Required format:
{
  "communication": { "score": 0-10, "feedback": "..." },
  "technical_knowledge": { "score": 0-10, "feedback": "..." },
  "confidence": { "score": 0-10, "feedback": "..." },
  "body_language": { "score": 0-10, "feedback": "..." },
  "overall_score": 0-100,
  "summary": "...",
  "improvement_tips": ["...", "..."]
}

Chat History:
${chatText}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "video/webm",
                data: videoBase64
              }
            },
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        responseMimeType: "application/json"
      }
    });

    let evalText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Remove surrounding backticks and potential markdown
    evalText = evalText.trim().replace(/^```json/, "").replace(/```$/, "").trim();

    try {
      const evaluation = JSON.parse(evalText);
      if (!evaluation.overall_score || !evaluation.summary) {
        throw new Error("Incomplete evaluation received");
      }
      return evaluation;
    } catch (err) {
      throw {
        message: `Invalid JSON: ${err.message}`,
        rawResponse: evalText
      };
    }
  }

  function getFallbackEvaluation(msg) {
    return {
      communication: { score: 0, feedback: "Evaluation failed" },
      technical_knowledge: { score: 0, feedback: "Evaluation failed" },
      confidence: { score: 0, feedback: "Evaluation failed" },
      body_language: { score: 0, feedback: "Evaluation failed" },
      overall_score: 0,
      summary: "Could not evaluate: " + msg,
      improvement_tips: [
        "Try re-running the interview.",
        "Make sure the camera and mic were working properly."
      ]
    };
  }

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 p-4 gap-4">
      {/* Main video layout */}
      <div className="flex-1 flex flex-col bg-gray-900 rounded-2xl overflow-hidden relative shadow-xl">
        {/* User identification */}
        <div className="absolute top-4 left-4 flex items-center gap-3 bg-black bg-opacity-50 p-2 rounded-lg z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            {isInterviewStarted && <span>RG</span>}
          </div>
          <div className="text-white">
            <div className="font-medium">Richard Gomez</div>
            <div className="text-xs opacity-80">Talent</div>
          </div>
        </div>
        
        {/* Recording indicator */}
        {isInterviewStarted && (
          <div className="absolute top-4 left-36 flex items-center gap-2 bg-black bg-opacity-50 px-3 py-1 rounded-full z-10">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-white text-xs">Recording</span>
          </div>
        )}
        
        {/* Volume level indicator */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-2 h-32 bg-black bg-opacity-50 rounded-full flex flex-col justify-end overflow-hidden z-10">
          <div 
            className="w-full bg-gradient-to-t from-indigo-400 to-purple-600"
            style={{height: `${volumeLevel}%`}}
          ></div>
        </div>
        
        {/* Main video feed */}
        <div className="relative flex-1 bg-black">
          {!isInterviewStarted ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Camera size={48} />
              <p className="mt-4 text-center">Camera feed will appear here<br />Click Start Interview to begin</p>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
        </div>
        
        {/* Call controls - Ensure this section is always visible */}
        <div className="p-4 flex justify-center gap-4 absolute bottom-5 w-full">
          <button 
            onClick={toggleAudio} 
            className={`w-12 h-12 rounded-full flex items-center justify-center ${audioMuted ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-90 transition-all`}
          >
            {audioMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          
          <button 
            onClick={toggleVideo} 
            className={`w-12 h-12 rounded-full flex items-center justify-center ${videoMuted ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-90 transition-all`}
          >
            {videoMuted ? <VideoOff size={18} /> : <Video size={18} />}
          </button>
          
          <button 
            onClick={isInterviewStarted ? endInterview : startInterview}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${isInterviewStarted ? 'bg-red-500' : 'bg-green-500'} text-white hover:opacity-90 transition-all`}
          >
            <Phone size={18} className={isInterviewStarted ? 'rotate-135' : ''} />
          </button>
          
          <button className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 text-white hover:opacity-90 transition-all">
            <ScreenShare size={18} />
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 text-white hover:opacity-90 transition-all"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Right sidebar - participants and chat */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        {/* Chat section */}
        <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Interview Chat</h3>
            <button className="text-gray-500">
              <MoreVertical size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <svg className="w-12 h-12 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm">Start the interview to begin chatting</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs mt-1 block opacity-70">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="relative">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={!isInterviewStarted}
                placeholder={isInterviewStarted ? "Type your answer..." : "Start interview to chat"}
                className="w-full rounded-full py-2 px-4 pr-12 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={sendMessage}
                disabled={!isInterviewStarted || !currentInput.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
              {isListening ? (
                <span className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Listening... Release space bar to send
                </span>
              ) : (
                "Hold space bar to speak"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Call Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Microphone</label>
                <select className="w-full p-2 border rounded">
                  <option>Default Microphone</option>
                  <option>Headset Microphone</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Camera</label>
                <select className="w-full p-2 border rounded">
                  <option>Default Camera</option>
                  <option>External Webcam</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Background</label>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-gray-900"></button>
                  <button className="w-8 h-8 rounded-full bg-blue-500"></button>
                  <button className="w-8 h-8 rounded-full bg-green-500"></button>
                  <button className="w-8 h-8 rounded-full bg-purple-500"></button>
                  <button className="w-8 h-8 rounded-full bg-red-500"></button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Volume</label>
                <div className="flex items-center gap-2">
                  <Volume size={16} />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volumeLevel} 
                    onChange={(e) => setVolumeLevel(e.target.value)} 
                    className="w-full"
                  />
                  <Volume2 size={16} />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {evaluationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Interview Evaluation</h2>
                <button onClick={() => setEvaluationResult(null)} className="text-gray-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              
              {evaluationResult.error ? (
                <div className="bg-red-50 p-6 rounded-xl text-center">
                  <div className="text-red-500 mb-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Evaluation Error</h3>
                  <p className="text-gray-600 mb-4">{evaluationResult.message}</p>
                  {evaluationResult.rawResponse && (
                    <details className="text-left">
                      <summary className="cursor-pointer text-indigo-600 font-medium">Show raw response</summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">{evaluationResult.rawResponse}</pre>
                    </details>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <svg className="w-40 h-40" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" stroke="#e0e0e0" strokeWidth="8" fill="none"></circle>
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="54" 
                          stroke="#4f46e5" 
                          strokeWidth="8" 
                          fill="none" 
                          strokeLinecap="round"
                          strokeDasharray="339.292" 
                          strokeDashoffset={339.292 * (1 - evaluationResult.overall_score / 100)}
                          transform="rotate(-90 60 60)"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <div className="text-3xl font-bold">{evaluationResult.overall_score}</div>
                          <div className="text-gray-500 text-sm">Score</div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600 mx-auto max-w-lg">{evaluationResult.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EvaluationCategory 
                      title="Communication"
                      data={evaluationResult.communication}
                      color="indigo"
                    />
                    <EvaluationCategory 
                      title="Technical Knowledge"
                      data={evaluationResult.technical_knowledge}
                      color="blue"
                    />
                    <EvaluationCategory 
                      title="Confidence"
                      data={evaluationResult.confidence}
                      color="green"
                    />
                    <EvaluationCategory 
                      title="Body Language"
                      data={evaluationResult.body_language}
                      color="purple"
                    />
                  </div>
                  
                  <div className="bg-indigo-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-4 text-indigo-900">Improvement Tips</h3>
                    <ul className="space-y-3">
                      {evaluationResult.improvement_tips.map((tip, i) => (
                        <li key={i} className="flex gap-3">
                          <div className="flex-shrink-0 text-indigo-500 mt-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => setEvaluationResult(null)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Close Evaluation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EvaluationCategory({ title, data, color }) {
  // Map color names to Tailwind classes
  const colorMap = {
    indigo: "bg-indigo-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500"
  };
  
  return (
    <div className="bg-gray-50 p-5 rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">{title}</h4>
        <div className="text-lg font-bold">{data.score}/10</div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full ${colorMap[color] || "bg-indigo-500"}`}
          style={{ width: `${data.score * 10}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600">{data.feedback}</p>
    </div>
  );
}