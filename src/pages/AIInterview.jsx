import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GoogleGenAI } from "@google/genai";
import './interview.css';

export default function AIInterview() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const captureIntervalRef = useRef(null);

  const ai = new GoogleGenAI({
    apiKey: "AIzaSyBQgUq_pscmRRw36Y7HKt3dvDTgKTQvUA4"
  });

  async function startInterview() {
    try {
      setIsInterviewStarted(true);
      await startVideoCapture();
      setChatHistory([{
        role: "ai",
        content: "Hello! Welcome to your AI-powered interview. Let's begin with some technical questions. Can you tell me about your experience with React?"
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

  async function sendMessage() {
    if (!currentInput.trim()) return;

    const userMessage = {
      role: "user",
      content: currentInput,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setCurrentInput("");

    const aiReply = await getAIResponse(currentInput);
    const aiMessage = {
      role: "ai",
      content: aiReply,
      timestamp: new Date().toISOString()
    };

    setChatHistory([...updatedHistory, aiMessage]);
  }

  async function getAIResponse(query) {
    const lower = query.toLowerCase();
    if (lower.includes("hello") || lower.includes("hi")) {
      return "Hello! Let's begin. Can you tell me about your experience with React?";
    } else if (lower.includes("experience") || lower.includes("react")) {
      return "How would you handle state management in a large React application?";
    } else if (lower.includes("state") || lower.includes("management")) {
      return "Great. Can you explain the Virtual DOM and its benefits?";
    } else if (lower.includes("dom") || lower.includes("virtual")) {
      return "Tell me about a technical challenge you faced and how you solved it.";
    } else if (lower.includes("challenge") || lower.includes("problem")) {
      return "Thanks! Where do you see your career in 5 years?";
    } else if (lower.includes("career") || lower.includes("future")) {
      return "That concludes our interview. Would you like me to evaluate your performance?";
    } else {
      return "Can you elaborate on that point?";
    }
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

  return (
    <div className="interview-container">
      <div className="video-section">
        <video ref={videoRef} autoPlay playsInline className="camera-feed" />
        {!isInterviewStarted ? (
          <Button onClick={startInterview} className="start-button">
            Start Interview
          </Button>
        ) : (
          <Button onClick={endInterview} disabled={isLoading} className="stop-button">
            {isLoading ? "Evaluating..." : "End Interview"}
          </Button>
        )}
      </div>

      <div className="chat-section">
        <div className="chat-messages">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>

        <div className="message-form">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={!isInterviewStarted}
            placeholder={isInterviewStarted ? "Type your answer..." : "Start the interview to begin"}
          />
          <Button onClick={sendMessage} disabled={!isInterviewStarted} className="send-button">
            Send
          </Button>
        </div>
      </div>

      {/* {evaluationResult && (
        <div className="evaluation-modal">
          <div className="evaluation-content">
            <h2>Interview Evaluation</h2>
            {evaluationResult.error ? (
              <>
                <h3>Error</h3>
                <p>{evaluationResult.message}</p>
                <pre>{evaluationResult.rawResponse}</pre>
              </>
            ) : (
              <>
                <p><strong>Overall Score:</strong> {evaluationResult.overall_score}</p>
                <p><strong>Summary:</strong> {evaluationResult.summary}</p>
                <ul>
                  {Object.entries(evaluationResult).map(([key, value]) => (
                    typeof value === 'object' && value?.score !== undefined && (
                      <li key={key}><strong>{key}</strong>: {value.score}/10 - {value.feedback}</li>
                    )
                  ))}
                </ul>
                <h4>Improvement Tips:</h4>
                <ul>
                  {evaluationResult.improvement_tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )} */}

            {/* Evaluation Results Modal */}
            {evaluationResult && (
              <div className="evaluation-modal">
                <div className="evaluation-content">
                  <h2>Interview Evaluation</h2>
                  
                  {evaluationResult.error ? (
                    <div className="error-message">
                      <h3>Evaluation Error</h3>
                      <p>{evaluationResult.message}</p>
                      {evaluationResult.rawResponse && (
                        <details>
                          <summary>Show raw response</summary>
                          <pre>{evaluationResult.rawResponse}</pre>
                        </details>
                      )}
                    </div>
                  ) : null}
                  
                  <div className="evaluation-results">
                    <div className="overall-score">
                      <h3>Overall Score</h3>
                      <p className="score">{evaluationResult.overall_score || evaluationResult.fallbackData?.overall_score}/100</p>
                      <p>{evaluationResult.summary || evaluationResult.fallbackData?.summary}</p>
                    </div>
      
                    <div className="categories-grid">
                      <EvaluationCategory 
                        title="Communication"
                        data={evaluationResult.communication || evaluationResult.fallbackData?.communication}
                      />
                      <EvaluationCategory 
                        title="Technical Knowledge"
                        data={evaluationResult.technical_knowledge || evaluationResult.fallbackData?.technical_knowledge}
                      />
                      <EvaluationCategory 
                        title="Confidence"
                        data={evaluationResult.confidence || evaluationResult.fallbackData?.confidence}
                      />
                      <EvaluationCategory 
                        title="Body Language"
                        data={evaluationResult.body_language || evaluationResult.fallbackData?.body_language}
                      />
                    </div>
      
                    {(evaluationResult.improvement_tips || evaluationResult.fallbackData?.improvement_tips) && (
                      <div className="improvement-tips">
                        <h3>Improvement Tips</h3>
                        <ul>
                          {(evaluationResult.improvement_tips || evaluationResult.fallbackData?.improvement_tips).map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
      
                  <Button
                    onClick={() => setEvaluationResult(null)}
                    className="close-button"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
    </div>
  );
}

function EvaluationCategory({ title, data }) {
    return (
      <div className="evaluation-category">
        <h4>{title}</h4>
        <div className="score-bar">
          <div 
            className="score-fill"
            style={{ width: `${data.score * 10}%` }}
          ></div>
        </div>
        <p className="score-text">{data.score}/10</p>
        <p className="feedback">{data.feedback}</p>
      </div>
    );
  }