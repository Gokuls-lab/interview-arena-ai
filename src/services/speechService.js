
// This service handles text-to-speech and speech-to-text functionality

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.recognition = null;
    this.isListening = false;
    this.transcript = '';
    this.onTranscriptUpdate = null;
    this.onSpeechEnd = null;

    // Initialize speech recognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        this.transcript = finalTranscript;
        
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(finalTranscript, interimTranscript);
        }
      };
      
      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition.start();
        } else if (this.onSpeechEnd) {
          this.onSpeechEnd(this.transcript);
        }
      };
    }
  }

  // Text-to-speech methods
  speak(text, options = {}) {
    if (!this.synth) return false;
    
    // Cancel any ongoing speech
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    if (options.voice) {
      utterance.voice = options.voice;
    }
    
    // Add events
    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;
    
    this.synth.speak(utterance);
    return true;
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      return true;
    }
    return false;
  }

  getVoices() {
    return this.synth ? this.synth.getVoices() : [];
  }

  // Speech-to-text methods
  startListening(options = {}) {
    if (!this.recognition) return false;
    
    this.transcript = '';
    this.isListening = true;
    
    if (options.onTranscriptUpdate) {
      this.onTranscriptUpdate = options.onTranscriptUpdate;
    }
    
    if (options.onSpeechEnd) {
      this.onSpeechEnd = options.onSpeechEnd;
    }
    
    try {
      this.recognition.lang = options.language || 'en-US';
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  stopListening() {
    if (!this.recognition || !this.isListening) return false;
    
    this.isListening = false;
    try {
      this.recognition.stop();
      return true;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      return false;
    }
  }

  isRecognitionSupported() {
    return !!this.recognition;
  }
}

// Create a singleton instance
const speechService = new SpeechService();

export default speechService;
