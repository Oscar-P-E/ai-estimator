import ChatInterfaceClient from '../../components/ChatInterfaceClient';
import { notFound } from 'next/navigation';

interface BusinessPageProps {
  params: { slug: string };
}

export default function BusinessChatPage({ params }: BusinessPageProps) {
  const { slug } = params;

  // In a real app, you'd fetch business info by slug here
  if (!slug) return notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl mx-auto my-8 p-0 sm:p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800">
        <header className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-extrabold bg-gradient-to-tr from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg mt-6">
            Chat with {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
            Welcome! This AI assistant will use this business's uploaded pricing documents to ask you questions and generate a personalized quote. Just describe what you need, and the AI will guide you.
          </p>
        </header>
        <div className="flex-1 flex flex-col min-h-[500px]">
          <ChatInterfaceClient />
        </div>
      </div>
    </main>
  );
} 