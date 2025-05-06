'use client';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function TestSpeech() {
  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="p-8">
      <button
        onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'en-US' })}
        className="p-2 bg-green-500 text-white rounded-lg mr-2"
      >
        Start
      </button>
      <button
        onClick={SpeechRecognition.stopListening}
        className="p-2 bg-red-500 text-white rounded-lg"
      >
        Stop
      </button>
      <p className="mt-4">Microphone: {listening ? 'on' : 'off'}</p>
      <p className="mt-2">Transcript: <span className="font-mono">{transcript}</span></p>
    </div>
  );
} 