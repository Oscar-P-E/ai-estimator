'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import ChatInterface with SSR disabled
const ChatInterface = dynamic(() => import('./ChatInterface'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto p-2 sm:p-4">
      <div className="flex-1 mb-4 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
      </div>
      <div className="flex gap-2 items-center bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg px-2 py-2 border border-gray-200 dark:border-gray-700">
        <div className="flex-1 h-[44px] bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  ),
});

export default function ChatInterfaceClient() {
  return (
    <Suspense fallback={null}>
      <ChatInterface />
    </Suspense>
  );
} 