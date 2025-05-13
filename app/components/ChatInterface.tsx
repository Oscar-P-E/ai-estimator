'use client';

import { useState, useRef, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Helper to generate a morphing blob path
function generateBlobPath(centerX: number, centerY: number, baseRadius: number, points: number, audioLevel: number, t: number) {
  const step = (Math.PI * 2) / points;
  let d = '';
  for (let i = 0; i < points; i++) {
    const angle = i * step;
    // Use sine waves for organic movement
    const amp = baseRadius * (0.15 + audioLevel * 1.2) * Math.sin(t + i * 0.7 + Math.sin(t + i));
    const r = baseRadius + amp;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    d += i === 0 ? `M${x},${y}` : ` Q${centerX + Math.cos(angle - step / 2) * r},${centerY + Math.sin(angle - step / 2) * r} ${x},${y}`;
  }
  d += ' Z';
  return d;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [mounted, setMounted] = useState(false);
  const [transcriptionMessage, setTranscriptionMessage] = useState('');
  const [showBlob, setShowBlob] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // for blob animation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  // Animated blob state
  const [blobTime, setBlobTime] = useState(0);
  const blobAnimationRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [justTranscribed, setJustTranscribed] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Helper function to resize textarea
  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  // Callback ref for textarea to focus when mounted after transcription
  const textareaCallbackRef = (el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    if (el && justTranscribed) {
      // First resize the textarea
      resizeTextarea(el);
      // Then focus and scroll to end
      el.focus();
      el.selectionStart = el.selectionEnd = el.value.length;
      // Ensure cursor is visible by scrolling textarea to end
      el.scrollTop = el.scrollHeight;
      setJustTranscribed(false);
    }
  };

  // Effect to handle textarea resize when input changes programmatically
  useEffect(() => {
    if (textareaRef.current && input) {
      resizeTextarea(textareaRef.current);
    }
  }, [input]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('Transcript:', transcript);
    if (transcript) {
      setInput(transcript);
      setJustTranscribed(true);
    }
  }, [transcript]);

  useEffect(() => {
    console.log('Listening:', listening);
  }, [listening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    console.log('Browser supports speech recognition:', browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    setTranscriptionMessage('');
  }, [input, isRecording]);

  // Animate the blob time for morphing
  useEffect(() => {
    if (!showBlob) return;
    let running = true;
    const animate = () => {
      setBlobTime((t) => t + 0.04);
      if (running) blobAnimationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      running = false;
      if (blobAnimationRef.current) cancelAnimationFrame(blobAnimationRef.current);
    };
  }, [showBlob]);

  // Cleanup function for audio resources
  const cleanupAudioResources = () => {
    // Stop media recorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    // Stop speech recognition
    if (listening) {
      SpeechRecognition.stopListening();
    }
    
    // Stop and cleanup audio stream tracks
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Close audio context
    if (analyserRef.current) {
      analyserRef.current.disconnect();
    }

    setIsRecording(false);
    setShowBlob(false);
    setAudioLevel(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    resetTranscript();

    try {
      // TODO: integrate with AI service
      // For now, we'll just echo back the message
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response || 'I apologize, but I encountered an error.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request.'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const startRecording = async () => {
    try {
      // Clean up any existing recording first
      cleanupAudioResources();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setShowBlob(true);
      setIsTranscribing(false);
      setIsRecording(true);

      // Set up Web Audio API for volume detection
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start speech recognition
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
      
      // Animate blob based on volume
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const animate = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setAudioLevel(rms);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();

      // Set up MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      setMediaRecorder(recorder);
      let localAudioChunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        localAudioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        cleanupAudioResources();
        setIsTranscribing(true);
        
        const audioBlob = new Blob(localAudioChunks, { type: 'audio/webm' });
        if (audioBlob.size < 1024) {
          setTranscriptionMessage('Recording was too short. Please try speaking for a bit longer.');
          setIsTranscribing(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        
        try {
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          
          setIsTranscribing(false);
          if (data.transcription) {
            setInput(data.transcription);
            setTranscriptionMessage('');
          } else if (data.error) {
            if (data.error === 'No transcription generated' || 
                (data.details && data.details.includes('no transcript'))) {
              setTranscriptionMessage('No speech detected. Please try speaking more clearly or for a bit longer.');
            } else {
              setTranscriptionMessage(`Failed to transcribe audio: ${data.error}`);
            }
          }
        } catch (error) {
          console.error('Error sending audio for transcription:', error);
          setTranscriptionMessage('Failed to send audio for transcription. Please try again.');
          setIsTranscribing(false);
        }
      };

      recorder.start();
    } catch (err) {
      console.error('Could not access microphone:', err);
      alert('Could not access microphone.');
      cleanupAudioResources();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      setIsTranscribing(true);
      mediaRecorder.stop();
      cleanupAudioResources();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto p-2 sm:p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-1 sm:px-2 transition-all duration-300">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`relative max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl shadow-md transition-all duration-300 animate-fade-in
              ${
                message.role === 'user'
                  ? 'ml-auto bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-100 text-gray-800 rounded-bl-md border border-gray-200 dark:border-gray-700'
              }`
            }
            style={{ wordBreak: 'break-word' }}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg px-2 py-2 border border-gray-200 dark:border-gray-700">
        {showBlob ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[56px] relative">
            {/* Advanced animated blob SVG */}
            <svg width="120" height="120" viewBox="0 0 120 120">
              <defs>
                <radialGradient id="metallic" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#e0e7ef" />
                  <stop offset="60%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#18181b" />
                </radialGradient>
                <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d={generateBlobPath(60, 60, 38, 12, audioLevel, blobTime)}
                fill="url(#metallic)"
                filter="url(#glow)"
                opacity={0.95}
              />
            </svg>
            {isTranscribing && (
              <div className="absolute bottom-[-24px] text-base text-gray-700 dark:text-gray-200 font-medium animate-pulse">
                Thinking...
              </div>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaCallbackRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resizeTextarea(e.target);
            }}
            rows={1}
            className="flex-1 resize-none p-3 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 transition-all shadow-inner min-h-[44px] max-h-[160px] text-base leading-relaxed placeholder-gray-400 dark:placeholder-gray-500 overflow-y-auto"
            placeholder="Type or speak…"
            style={{ minHeight: 44, maxHeight: 160 }}
          />
        )}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500
            ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center justify-center ml-2`}
          title={isRecording ? 'Stop recording' : 'Speak to input message'}
        >
          {isRecording ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 mr-1">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span className="font-semibold">Stop</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 mr-1">
                <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 1 1 2 0 7 7 0 0 1-6 6.92V21a1 1 0 1 1-2 0v-2.08A7 7 0 0 1 5 12a1 1 0 1 1 2 0 5 5 0 0 0 10 0z" />
              </svg>
              <span className="font-semibold">Speak</span>
            </>
          )}
        </button>
        <button
          type="submit"
          className="p-3 rounded-full bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white shadow-md transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 ml-2"
          title="Send message"
        >
          <span className="font-semibold">Send</span>
        </button>
      </form>
      {transcriptionMessage && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 text-center animate-fade-in">
          {transcriptionMessage}
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s;
        }
      `}</style>
    </div>
  );
} 