import ChatInterfaceClient from '../../components/ChatInterfaceClient';
import { notFound } from 'next/navigation';

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessChatPage({ params }: BusinessPageProps) {
  const { slug } = await params;

  // Phase 0: Using slug directly for now. In Phase 1, we'll fetch business info from database by slug
  if (!slug) return notFound();

  return (
    <main className="flex-1 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <div className="w-full max-w-3xl mx-auto my-4 sm:my-6 p-4 sm:p-6 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800 flex flex-col flex-1">
        <header className="flex flex-col items-center mb-6 flex-shrink-0">
          <h2 className="text-3xl font-extrabold bg-gradient-to-tr from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg mt-6">
            Get Your Quote
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
            Welcome! Our AI assistant will help you get an accurate quote by asking you questions about your project. Just describe what you need, and we&apos;ll guide you through the process.
          </p>
        </header>
        <div className="flex-1 flex flex-col min-h-0">
          <ChatInterfaceClient />
        </div>
      </div>
    </main>
  );
} 