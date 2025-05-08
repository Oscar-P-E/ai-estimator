'use client';

import { useState, useRef, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('Transcript:', transcript);
    if (transcript) {
      setInput(transcript);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    resetTranscript();

    try {
      // Here you would integrate with your AI service
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

  const toggleListening = () => {
    console.log('Toggling listening. Current state:', listening);
    if (listening) {
      SpeechRecognition.stopListening();
      setIsRecording(false);
      console.log('Stopped listening');
    } else {
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
      setIsRecording(true);
      resetTranscript();
      console.log('Started listening');
    }
  };

  // Audio recording handlers
  const startRecording = async () => {
    setAudioChunks([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      recorder.ondataavailable = (e) => {
        setAudioChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.transcript) {
          setInput(data.transcript);
        }
      };
    } catch (err) {
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
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
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 transition-all"
          placeholder="Type or speak…"
        />
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500
            ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center justify-center`}
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
          className="p-3 rounded-full bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white shadow-md transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500"
          title="Send message"
        >
          <span className="font-semibold">Send</span>
        </button>
      </form>
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