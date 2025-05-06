import ChatInterfaceClient from './components/ChatInterfaceClient';
// import TestSpeech from './components/TestSpeech';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl mx-auto my-8 p-0 sm:p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800">
        <header className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mt-6">
            <span className="inline-block bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full p-2 shadow-lg">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="url(#paint0_linear_1_2)"/>
                <defs>
                  <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA"/>
                    <stop offset="1" stopColor="#A78BFA"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <h1 className="text-4xl font-extrabold bg-gradient-to-tr from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
              AI-Powered Quoting Assistant
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
            <span className="font-semibold">For business owners:</span> Log in, upload your pricing documents, and get a unique public chat page for your clients.<br />
            <span className="font-semibold">For clients:</span> Visit your business's chat page and get instant, AI-powered quotes based on real pricing data.
          </p>
        </header>
        <div className="flex-1 flex flex-col min-h-[500px]">
          <ChatInterfaceClient />
        </div>
      </div>
    </main>
  );
}
