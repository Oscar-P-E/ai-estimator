'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import LottieBlob from './LottieBlob';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}



export default function ChatInterface() {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [transcriptionMessage, setTranscriptionMessage] = useState('');
  const [showBlob, setShowBlob] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // for blob animation
  const [isLoading, setIsLoading] = useState(false);
  const [usedVoiceInput, setUsedVoiceInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [justTranscribed, setJustTranscribed] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Extract businessId from pathname
  const businessId = pathname?.startsWith('/business/') ? pathname.split('/')[2] : undefined;

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Callback ref for textarea to focus when mounted after transcription
  const textareaCallbackRef = (el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    if (el && justTranscribed) {
      // First resize the textarea
      el.focus();
      el.selectionStart = el.selectionEnd = el.value.length;
      // Ensure cursor is visible by scrolling textarea to end
      el.scrollTop = el.scrollHeight;
      setJustTranscribed(false);
    }
  };



  useEffect(() => {
    console.log('Transcript:', transcript);
    if (transcript) {
      setInput(transcript);
      setJustTranscribed(true);
      setUsedVoiceInput(true);
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

  // Function to play audio response
  const playAudioResponse = (audioBase64: string) => {
    try {
      // Convert base64 to blob
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Error playing audio response:', error);
    }
  };

  const cleanupAudioResources = useCallback((keepAnalyzer = false) => {
    // Stop media recorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    // Stop speech recognition
    if (listening) {
      SpeechRecognition.stopListening();
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Close audio stream
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }

    // Clear analyzer reference unless keeping it
    if (!keepAnalyzer && analyserRef.current) {
      analyserRef.current = null;
    }

    // Reset states
    if (!keepAnalyzer) {
      setIsRecording(false);
      setIsTranscribing(false);
      setAudioLevel(0);
      setShowBlob(false);
    }
  }, [mediaRecorder, listening, audioStream, animationFrameRef, analyserRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, [cleanupAudioResources]);

  // Shared function to send message (used by both form submit and auto-send)
  const sendMessage = async (messageText: string, wasVoiceInput: boolean) => {
    if (!messageText.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    resetTranscript();
    setUsedVoiceInput(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          conversationHistory: updatedMessages, // Include full conversation history
          businessId: businessId,
          isVoiceInput: wasVoiceInput
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response || 'I apologize, but I encountered an error.'
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Play audio response if available and user used voice input
      if (data.audioResponse && wasVoiceInput) {
        console.log('Playing TTS audio response...');
        playAudioResponse(data.audioResponse);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Stop recording if it's still active
    if (isRecording) {
      stopRecording();
    }

    const userInput = input;
    const wasVoiceInput = usedVoiceInput;
    
    await sendMessage(userInput, wasVoiceInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && !isRecording) {
        // Create a synthetic form event
        const formEvent = {
          preventDefault: () => {},
        } as React.FormEvent;
        handleSubmit(formEvent);
      }
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      const localAudioChunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        localAudioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(localAudioChunks, { type: 'audio/webm' });
        if (audioBlob.size < 1024) {
          setTranscriptionMessage('Recording was too short. Please try speaking for a bit longer.');
          setIsTranscribing(false);
          cleanupAudioResources();
          setShowBlob(false);
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
            setUsedVoiceInput(true);
            setTranscriptionMessage('');
            
            // Auto-send the message immediately after transcription
            cleanupAudioResources();
            setShowBlob(false);
            await sendMessage(data.transcription, true);
          } else if (data.error) {
            if (data.error === 'No transcription generated' || 
                (data.details && data.details.includes('no transcript'))) {
              setTranscriptionMessage('No speech detected. Please try speaking more clearly or for a bit longer.');
            } else {
              setTranscriptionMessage(`Failed to transcribe audio: ${data.error}`);
            }
            // Only cleanup resources after transcription is complete
            cleanupAudioResources();
            setShowBlob(false);
          }
        } catch (error) {
          console.error('Error sending audio for transcription:', error);
          setTranscriptionMessage('Failed to send audio for transcription. Please try again.');
          setIsTranscribing(false);
          cleanupAudioResources();
          setShowBlob(false);
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
      // Keep the analyzer running while transcribing
      cleanupAudioResources(true);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn&apos;t support speech recognition.</span>;
  }

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto p-2 sm:p-4 relative">
      {showBlob && (
        <div className="fixed bottom-[20%] left-1/2 transform -translate-x-1/2 z-10 transition-all duration-500 ease-in-out">
          <div className={`transition-all duration-300 ${isTranscribing ? 'scale-110' : ''}`}>
            <LottieBlob audioLevel={audioLevel} />
            {isTranscribing && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 text-base text-gray-700 dark:text-gray-200 font-medium animate-pulse">
                Thinking...
              </div>
            )}
          </div>
        </div>
      )}
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
            {message.role === 'assistant' ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown 
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 pl-4 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children }) => <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">{children}</code>,
                    h3: ({ children }) => <h3 className="font-semibold text-lg mb-2">{children}</h3>,
                    h4: ({ children }) => <h4 className="font-semibold text-base mb-1">{children}</h4>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              message.content
            )}
          </div>
        ))}
        {isLoading && (
          <div className="max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl shadow-md transition-all duration-300 bg-gray-100 dark:bg-gray-800 dark:text-gray-100 text-gray-800 rounded-bl-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-end bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg px-2 py-2 border border-gray-200 dark:border-gray-700">
        <TextareaAutosize
          ref={textareaCallbackRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          minRows={1}
          maxRows={6}
          className="flex-1 resize-none p-3 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 transition-all shadow-inner min-h-[44px] max-h-[160px] text-base leading-relaxed placeholder-gray-400 dark:placeholder-gray-500 overflow-y-auto"
          placeholder="Type or speak…"
        />
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
          disabled={isRecording || isLoading}
          className={`p-3 rounded-full shadow-md transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 ml-2 
            ${isRecording || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800'} text-white`}
          title={isRecording ? "Recording will auto-send" : "Send message"}
        >
          <span className="font-semibold">
            {isRecording ? 'Auto-send' : 'Send'}
          </span>
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