
// This service handles video recording at 1fps and storage

class VideoRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.interval = null;
    this.frameRate = 1; // 1 frame per second
  }

  async startRecording() {
    try {
      // Request user media with video only
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          frameRate: { ideal: this.frameRate, max: this.frameRate }
        }, 
        audio: true 
      });
      
      // Create a new media recorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 100000 // Low bitrate for smaller file size
      });
      
      // Event handler for when data is available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      // Start recording
      this.mediaRecorder.start(1000); // Capture data every second
      
      return this.stream;
    } catch (error) {
      console.error('Error starting video recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        try {
          // Create a blob from the recorded chunks
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
          
          // Convert to base64 for storage or transmission
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result;
            
            // Stop all tracks in the stream
            this.stream.getTracks().forEach(track => track.stop());
            
            this.stream = null;
            this.mediaRecorder = null;
            this.recordedChunks = [];
            
            resolve({
              blob,
              base64: base64data,
              size: blob.size,
              type: blob.type,
              duration: this.recordedChunks.length // Approximate duration in seconds
            });
          };
          
          reader.onerror = (error) => {
            reject(error);
          };
        } catch (error) {
          reject(error);
        }
      };
      
      this.mediaRecorder.stop();
    });
  }

  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      return true;
    }
    return false;
  }

  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      return true;
    }
    return false;
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }

  isPaused() {
    return this.mediaRecorder && this.mediaRecorder.state === 'paused';
  }
  
  getRecordingState() {
    if (!this.mediaRecorder) return 'inactive';
    return this.mediaRecorder.state;
  }
}

// Create a singleton instance
const videoRecorder = new VideoRecorder();

export default videoRecorder;
