// Gemini Voice Chat - Floating Button Widget
// Embed this script on any webpage to add a voice chat button
(function() {
  // Define a unique namespace to prevent conflicts
  var GeminiVoiceWidget = {
    apiEndpoint: "https://kadencevoice-production.up.railway.app", // Railway deployment URL
    defaultVoice: "Aoede", // Using only Aoede voice
    clientToken: "3a7c6f8d2e1b4a9c8f7e6d5c4b3a2e1d", // Client verification token
    button: null,
    voicePanel: null,
    websocket: null,
    mediaRecorder: null,
    audioContext: null,
    isRecording: false,
    audioQueue: [],
    isInitialized: false,
    
    // Initialize the widget
    init: function() {
      if (this.isInitialized) return;
      
      // Add stylesheet
      this.addStyles();
      
      // Create floating button
      this.createButton();
      
      // Create voice panel (initially hidden)
      this.createVoicePanel();
      
      this.isInitialized = true;
    },
    
    // Add CSS styles for the widget
    addStyles: function() {
      const style = document.createElement('style');
      style.textContent = `
        .gemini-voice-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: #A373F8; /* Using Accent 1 color from image */
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: all 0.3s ease;
        }
        
        .gemini-voice-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0,0,0,0.3);
        }
        
        .gemini-voice-button.recording {
          background-color: #ff4d4d;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 77, 77, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
        }
        
        .gemini-voice-panel {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 300px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 16px;
          z-index: 9998;
          display: none;
        }
        
        .gemini-voice-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .gemini-voice-panel-title {
          font-weight: 600;
          color: #111111; /* Dark text color */
          margin: 0;
        }
        
        .gemini-voice-close {
          background: none;
          border: none;
          color: #111111;
          cursor: pointer;
          font-size: 18px;
        }
        
        .gemini-voice-status {
          background-color: #f5f5f5;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #555555;
        }
        
        .gemini-voice-controls {
          display: flex;
          justify-content: center;
        }
        
        .gemini-voice-record-btn {
          background-color: #A373F8;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .gemini-voice-record-btn.recording {
          background-color: #ff4d4d;
        }
        
        .gemini-message-container {
          max-height: 200px;
          overflow-y: auto;
          margin-top: 12px;
          border-top: 1px solid #f0f0f0;
          padding-top: 12px;
        }
        
        .gemini-message {
          padding: 8px 12px;
          margin-bottom: 8px;
          border-radius: 4px;
          max-width: 85%;
          word-wrap: break-word;
        }
        
        .gemini-message-user {
          background-color: #A373F8;
          color: white;
          margin-left: auto;
        }
        
        .gemini-message-bot {
          background-color: #f0f0f0;
          color: #111111;
        }
      `;
      document.head.appendChild(style);
    },
    
    // Create the floating microphone button
    createButton: function() {
      this.button = document.createElement('button');
      this.button.className = 'gemini-voice-button';
      this.button.innerHTML = this.getMicrophoneIcon();
      this.button.setAttribute('title', 'Talk to Gemini');
      this.button.setAttribute('aria-label', 'Talk to Gemini');
      
      this.button.addEventListener('click', () => {
        this.toggleVoicePanel();
      });
      
      document.body.appendChild(this.button);
    },
    
    // Create the voice panel that appears when the button is clicked
    createVoicePanel: function() {
      this.voicePanel = document.createElement('div');
      this.voicePanel.className = 'gemini-voice-panel';
      this.voicePanel.innerHTML = `
        <div class="gemini-voice-panel-header">
          <h3 class="gemini-voice-panel-title">Gemini Voice Chat</h3>
          <button class="gemini-voice-close">&times;</button>
        </div>
        <div class="gemini-voice-status">Ready to chat</div>
        <div class="gemini-voice-controls">
          <button class="gemini-voice-record-btn">Start Recording</button>
        </div>
        <div class="gemini-message-container"></div>
      `;
      
      // Add event listeners
      const closeBtn = this.voicePanel.querySelector('.gemini-voice-close');
      closeBtn.addEventListener('click', () => {
        this.hideVoicePanel();
      });
      
      const recordBtn = this.voicePanel.querySelector('.gemini-voice-record-btn');
      recordBtn.addEventListener('click', () => {
        this.toggleRecording();
      });
      
      document.body.appendChild(this.voicePanel);
    },
    
    // Toggle the voice panel visibility
    toggleVoicePanel: function() {
      const isVisible = this.voicePanel.style.display === 'block';
      
      if (isVisible) {
        this.hideVoicePanel();
      } else {
        this.showVoicePanel();
      }
    },
    
    // Show the voice panel
    showVoicePanel: function() {
      this.voicePanel.style.display = 'block';
      
      // Initialize session if needed
      if (!this.websocket) {
        this.initSession();
      }
    },
    
    // Hide the voice panel
    hideVoicePanel: function() {
      this.voicePanel.style.display = 'none';
      
      // Stop recording if active
      if (this.isRecording) {
        this.stopRecording();
      }
    },
    
    // Initialize the voice chat session
    initSession: async function() {
      try {
        // Update status
        this.updateStatus('Initializing session...');
        
        // Get user data from window.chatbotConfig
        const userData = window.chatbotConfig || {};
        
        // Generate a session ID
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Initialize configuration with the backend
        const configResponse = await fetch(`${this.apiEndpoint}/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Token': this.clientToken // Use client token instead of API key
          },
          body: JSON.stringify({
            voice: this.defaultVoice,
            session_id: sessionId,
            username: userData.username || 'Guest',
            user_id: userData.userId || 'unknown',
            current_url: userData.currentUrl || window.location.href
          })
        });
        
        if (!configResponse.ok) {
          throw new Error('Failed to initialize session');
        }
        
        const configData = await configResponse.json();
        
        // Store session data
        this.sessionId = configData.session_id;
        this.token = configData.token;
        
        // Connect WebSocket
        this.connectWebSocket();
        
        // Update status
        this.updateStatus('Ready to chat');
        
        // Add a welcome message if we have the username
        if (userData.username) {
          this.addMessage(`Hello ${userData.username}! How can I help you today?`, 'bot');
        } else {
          this.addMessage('Hello! How can I help you today?', 'bot');
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        this.updateStatus('Error: Could not initialize session');
      }
    },
    
    // Connect to the WebSocket server
    connectWebSocket: function() {
      // Close existing connection if any
      if (this.websocket) {
        this.websocket.close();
      }
      
      // Create new WebSocket connection
      this.websocket = new WebSocket(`${this.getWebSocketUrl()}/stream/${this.token}`);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.updateStatus('Connected');
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'audio_response') {
            // Play audio response
            this.playAudioResponse(message.data);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateStatus('Connection error');
      };
      
      this.websocket.onclose = () => {
        console.log('WebSocket closed');
        this.updateStatus('Disconnected');
      };
    },
    
    // Toggle recording state
    toggleRecording: function() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    },
    
    // Start recording audio
    startRecording: async function() {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create audio context and recorder
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.mediaRecorder = new MediaRecorder(stream);
        
        let audioChunks = [];
        
        this.mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        this.mediaRecorder.onstop = async () => {
          // Create blob from recorded chunks
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          audioChunks = [];
          
          // Send to backend
          this.sendAudioToBackend(audioBlob);
        };
        
        // Start recording
        this.mediaRecorder.start();
        this.isRecording = true;
        
        // Update UI
        this.updateRecordingUI(true);
        this.updateStatus('Recording...');
        
      } catch (error) {
        console.error('Error starting recording:', error);
        this.updateStatus('Error: Could not access microphone');
      }
    },
    
    // Stop recording audio
    stopRecording: function() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
        
        // Update UI
        this.updateRecordingUI(false);
        this.updateStatus('Processing...');
      }
    },
    
    // Send recorded audio to backend
    sendAudioToBackend: async function(audioBlob) {
      try {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        
        reader.onloadend = () => {
          // Extract the base64 data
          const base64data = reader.result.split(',')[1];
          
          // Send via WebSocket
          if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
              type: 'audio_chunk',
              session_id: this.sessionId,
              data: base64data,
              sequence_number: 0
            }));
          } else {
            this.updateStatus('Error: Not connected');
          }
        };
      } catch (error) {
        console.error('Error sending audio:', error);
        this.updateStatus('Error: Could not send audio');
      }
    },
    
    // Play audio response from backend
    playAudioResponse: function(base64Audio) {
      try {
        // Convert base64 to array buffer
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and URL
        const audioBlob = new Blob([bytes], { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create audio element and play
        const audio = new Audio(audioUrl);
        
        audio.onplay = () => {
          this.updateStatus('Playing response...');
        };
        
        audio.onended = () => {
          this.updateStatus('Ready to chat');
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          this.updateStatus('Error playing audio');
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play();
      } catch (error) {
        console.error('Error playing audio response:', error);
        this.updateStatus('Error: Could not play response');
      }
    },
    
    // Update the status display
    updateStatus: function(status) {
      const statusElement = this.voicePanel.querySelector('.gemini-voice-status');
      if (statusElement) {
        statusElement.textContent = status;
      }
    },
    
    // Update UI for recording state
    updateRecordingUI: function(isRecording) {
      // Update button
      const recordBtn = this.voicePanel.querySelector('.gemini-voice-record-btn');
      if (recordBtn) {
        recordBtn.textContent = isRecording ? 'Stop Recording' : 'Start Recording';
        
        if (isRecording) {
          recordBtn.classList.add('recording');
        } else {
          recordBtn.classList.remove('recording');
        }
      }
      
      // Update floating button
      if (isRecording) {
        this.button.classList.add('recording');
      } else {
        this.button.classList.remove('recording');
      }
    },
    
    // Add a message to the chat
    addMessage: function(text, sender) {
      const container = this.voicePanel.querySelector('.gemini-message-container');
      
      if (container) {
        const messageEl = document.createElement('div');
        messageEl.className = `gemini-message gemini-message-${sender}`;
        messageEl.textContent = text;
        
        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
      }
    },
    
    // Helper: Get WebSocket URL from the API endpoint
    getWebSocketUrl: function() {
      // Replace http/https with ws/wss
      return this.apiEndpoint.replace(/^http/, 'ws');
    },
    
    // Helper: Microphone icon as SVG
    getMicrophoneIcon: function() {
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>`;
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      GeminiVoiceWidget.init();
    });
  } else {
    GeminiVoiceWidget.init();
  }
})(); 