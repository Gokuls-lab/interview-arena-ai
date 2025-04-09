
// This service simulates the interaction with Gemini AI for interviews

class AIInterviewService {
  constructor() {
    this.commonQuestions = {
      'software-developer': [
        "Tell me about yourself and your experience in software development.",
        "What programming languages are you most comfortable with?",
        "Describe a challenging project you worked on and how you solved the problems you encountered.",
        "How do you stay updated with the latest technologies and industry trends?",
        "Explain your approach to debugging a complex issue in your code.",
        "How do you handle code reviews and feedback from team members?",
        "Tell me about your experience with version control systems like Git.",
        "How do you ensure your code is maintainable and scalable?",
        "Describe your experience with agile methodologies.",
        "What's your approach to testing your code?"
      ],
      'data-scientist': [
        "Tell me about your background in data science.",
        "What data analysis tools and libraries are you familiar with?",
        "Explain a complex data project you worked on and the insights you derived.",
        "How do you approach feature selection in a machine learning model?",
        "Describe your experience with data visualization.",
        "How do you handle missing or incomplete data?",
        "Explain the difference between supervised and unsupervised learning.",
        "How do you evaluate the performance of a machine learning model?",
        "Describe your experience with big data technologies.",
        "How do you communicate technical findings to non-technical stakeholders?"
      ],
      'product-manager': [
        "Tell me about your experience in product management.",
        "How do you prioritize features in a product roadmap?",
        "Describe a product you launched from conception to release.",
        "How do you gather and incorporate user feedback?",
        "Tell me about a time when you had to make a difficult product decision.",
        "How do you work with engineering teams to deliver products on time?",
        "Describe your approach to product analytics and metrics.",
        "How do you balance business goals with user needs?",
        "Tell me about a product that failed and what you learned from it.",
        "How do you stay updated on market trends and competitor products?"
      ],
      'marketing': [
        "Tell me about your marketing experience.",
        "Describe a successful marketing campaign you've led.",
        "How do you measure the success of your marketing efforts?",
        "Tell me about your experience with digital marketing channels.",
        "How do you identify and target your audience?",
        "Describe your approach to content marketing.",
        "How do you stay updated with the latest marketing trends?",
        "Tell me about a marketing challenge you faced and how you overcame it.",
        "How do you allocate marketing budget across different channels?",
        "Describe your experience with marketing analytics and tools."
      ]
    };
    
    this.followUpResponses = [
      "That's interesting. Can you elaborate on that?",
      "Thank you for sharing. Could you provide a specific example?",
      "I'd like to understand more about your approach. Can you walk me through your process?",
      "That's helpful. How do you apply that knowledge in practical situations?",
      "Let's dig deeper into that. What challenges did you face?",
      "How did that experience shape your professional development?",
      "What skills did you gain from that experience?",
      "How would you handle a similar situation in the future?",
      "What metrics did you use to measure success in that scenario?",
      "How did that project align with the broader business objectives?"
    ];
    
    this.currentSession = null;
    this.questionHistory = [];
    this.responseHistory = [];
  }

  // Start a new interview session
  startSession(role) {
    this.currentSession = {
      role: role,
      startTime: new Date(),
      currentQuestionIndex: 0,
      questions: this.getQuestionsForRole(role),
      responses: [],
      score: 0,
      feedback: {}
    };
    
    this.questionHistory = [];
    this.responseHistory = [];
    
    return {
      sessionId: Date.now().toString(),
      role,
      firstQuestion: this.currentSession.questions[0]
    };
  }

  // Get a predefined set of questions for a role
  getQuestionsForRole(role) {
    // Default to software developer questions if role not found
    const roleQuestions = this.commonQuestions[role] || this.commonQuestions['software-developer'];
    
    // Shuffle and select 5-7 questions
    const shuffled = [...roleQuestions].sort(() => 0.5 - Math.random());
    const numQuestions = Math.floor(Math.random() * 3) + 5; // 5-7 questions
    
    return shuffled.slice(0, numQuestions);
  }

  // Process a candidate's response and get the next question
  async processResponse(response) {
    if (!this.currentSession) {
      throw new Error('No active interview session');
    }
    
    // Record the response
    this.responseHistory.push(response);
    
    // Evaluate response (in a real app, this would use Gemini API)
    const evaluation = this.evaluateResponse(response);
    
    // Update session with response and evaluation
    this.currentSession.responses.push({
      question: this.currentSession.questions[this.currentSession.currentQuestionIndex],
      response,
      evaluation
    });
    
    // Update score
    this.currentSession.score += evaluation.score;
    
    // Move to next question or end interview
    this.currentSession.currentQuestionIndex++;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if all questions have been asked
    if (this.currentSession.currentQuestionIndex >= this.currentSession.questions.length) {
      return this.generateFollowUpOrEnd();
    } else {
      // Return the next question
      const nextQuestion = this.currentSession.questions[this.currentSession.currentQuestionIndex];
      this.questionHistory.push(nextQuestion);
      
      return {
        type: 'question',
        text: nextQuestion,
        isLastQuestion: this.currentSession.currentQuestionIndex === this.currentSession.questions.length - 1
      };
    }
  }

  // Evaluates a candidate's response (mock of AI evaluation)
  evaluateResponse(response) {
    // In a real application, this would use Gemini API for analysis
    const wordCount = response.split(' ').length;
    
    let score;
    let feedback;
    
    if (wordCount < 10) {
      score = 1;
      feedback = "Your answer was too brief. Consider providing more details.";
    } else if (wordCount < 30) {
      score = 2;
      feedback = "Your answer was somewhat brief. Try to elaborate more.";
    } else if (wordCount < 50) {
      score = 3;
      feedback = "Decent answer. Good level of detail.";
    } else if (wordCount < 100) {
      score = 4;
      feedback = "Good answer with substantial detail.";
    } else {
      score = 5;
      feedback = "Excellent, comprehensive answer.";
    }
    
    return {
      score, // 1-5 scale
      feedback,
      details: {
        clarity: Math.min(5, Math.max(1, Math.floor(wordCount / 20))),
        relevance: Math.floor(Math.random() * 3) + 3, // 3-5 random score
        depth: Math.min(5, Math.max(1, Math.floor(wordCount / 25)))
      }
    };
  }

  // Decides whether to ask a follow-up or end the interview
  generateFollowUpOrEnd() {
    // 30% chance to ask a follow-up if not too many already
    const shouldAskFollowUp = Math.random() < 0.3 && this.questionHistory.length < 10;
    
    if (shouldAskFollowUp) {
      const followUp = this.followUpResponses[Math.floor(Math.random() * this.followUpResponses.length)];
      this.questionHistory.push(followUp);
      
      return {
        type: 'followUp',
        text: followUp
      };
    } else {
      // End the interview
      return this.endInterview();
    }
  }

  // End the interview and provide feedback
  endInterview() {
    if (!this.currentSession) {
      throw new Error('No active interview session');
    }
    
    // Calculate final score (normalized to 0-100)
    const maxPossibleScore = this.currentSession.questions.length * 5;
    const normalizedScore = Math.round((this.currentSession.score / maxPossibleScore) * 100);
    
    // Generate feedback
    const feedback = this.generateFeedback(normalizedScore);
    
    // Save feedback to session
    this.currentSession.feedback = feedback;
    this.currentSession.finalScore = normalizedScore;
    this.currentSession.endTime = new Date();
    
    // Return final result
    return {
      type: 'end',
      score: normalizedScore,
      feedback: feedback.overall,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      sessionSummary: {
        duration: Math.round((this.currentSession.endTime - this.currentSession.startTime) / 1000), // in seconds
        questionsAsked: this.questionHistory.length,
        responseQuality: feedback.responseQuality
      }
    };
  }

  // Generate comprehensive feedback based on score
  generateFeedback(score) {
    let overall, strengths, improvements, responseQuality;
    
    if (score >= 90) {
      overall = "Excellent interview performance! You demonstrated strong knowledge, provided detailed responses with relevant examples, and communicated clearly and confidently.";
      strengths = [
        "Provided comprehensive answers with concrete examples",
        "Communicated ideas clearly and effectively",
        "Demonstrated deep knowledge in your field",
        "Showed enthusiasm and passion for your work",
        "Structured your responses well with a clear logical flow"
      ];
      improvements = [
        "Continue to refine your storytelling to make responses even more memorable",
        "Consider preparing more quantifiable achievements to highlight your impact"
      ];
      responseQuality = "Excellent";
    } else if (score >= 75) {
      overall = "Very good interview performance. You provided solid answers with good examples and demonstrated strong communication skills.";
      strengths = [
        "Provided detailed answers to most questions",
        "Included relevant examples from your experience",
        "Communicated clearly and professionally",
        "Demonstrated good technical knowledge"
      ];
      improvements = [
        "Try to be more concise with some of your answers",
        "Include more specific, measurable results in your examples",
        "Further develop your explanations of technical concepts"
      ];
      responseQuality = "Very Good";
    } else if (score >= 60) {
      overall = "Good interview performance. You covered the basics well, though some answers could have been more detailed or include more specific examples.";
      strengths = [
        "Responded to all questions appropriately",
        "Demonstrated adequate knowledge in your field",
        "Maintained professional communication"
      ];
      improvements = [
        "Provide more specific examples from your experience",
        "Develop more detailed responses to technical questions",
        "Practice structuring your answers with the STAR method",
        "Work on highlighting your unique skills and contributions"
      ];
      responseQuality = "Good";
    } else if (score >= 40) {
      overall = "Satisfactory interview performance. You answered questions adequately but need to provide more detail and specific examples.";
      strengths = [
        "Responded to questions directly",
        "Showed basic knowledge in required areas",
        "Maintained professional demeanor"
      ];
      improvements = [
        "Significantly increase the detail in your responses",
        "Include concrete examples for each major point",
        "Develop more comprehensive explanations of your experience",
        "Practice articulating your thought process more clearly",
        "Focus on highlighting achievements rather than just responsibilities"
      ];
      responseQuality = "Satisfactory";
    } else {
      overall = "Your interview needs improvement. Focus on providing more complete answers with specific examples from your experience.";
      strengths = [
        "Showed willingness to answer all questions",
        "Demonstrated basic communication skills"
      ];
      improvements = [
        "Thoroughly prepare answers to common interview questions",
        "Develop detailed examples from your experience",
        "Practice explaining your technical knowledge more clearly",
        "Work on providing more structured and complete responses",
        "Consider researching the role and industry more deeply"
      ];
      responseQuality = "Needs Improvement";
    }
    
    return {
      overall,
      strengths,
      improvements,
      responseQuality
    };
  }

  // Get chat history
  getChatHistory() {
    if (!this.currentSession) return [];
    
    const history = [];
    
    // Combine questions and responses into a chat history
    for (let i = 0; i < this.questionHistory.length; i++) {
      history.push({
        role: 'assistant',
        content: this.questionHistory[i]
      });
      
      if (i < this.responseHistory.length) {
        history.push({
          role: 'user',
          content: this.responseHistory[i]
        });
      }
    }
    
    return history;
  }

  // Check if a new question should be generated via function calling
  shouldEndInterview() {
    if (!this.currentSession) return false;
    
    // End if all questions have been asked
    if (this.currentSession.currentQuestionIndex >= this.currentSession.questions.length) {
      return true;
    }
    
    // Or if the interview has been going on for too long (10 minutes)
    const durationInMinutes = (Date.now() - this.currentSession.startTime) / (1000 * 60);
    if (durationInMinutes > 10) {
      return true;
    }
    
    return false;
  }

  // Function for Gemini function calling (mock)
  getFunctionSpec() {
    return {
      name: "endInterview",
      description: "End the current interview session and generate feedback",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    };
  }
}

// Create a singleton instance
const aiInterviewService = new AIInterviewService();

export default aiInterviewService;
