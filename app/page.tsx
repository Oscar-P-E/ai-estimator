import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
// import TestSpeech from './components/TestSpeech';

export default function Home() {
  return (
    <main className="flex-1 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <div className="w-full max-w-4xl mx-auto my-4 sm:my-6 p-4 sm:p-6 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800">
        <header className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mt-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 via-purple-500 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Chat bubble base */}
                  <path d="M28 8C28 6.89543 27.1046 6 26 6H10C8.89543 6 8 6.89543 8 8V20C8 21.1046 8.89543 22 10 22H14L18 26L22 22H26C27.1046 22 28 21.1046 28 20V8Z" fill="white" fillOpacity="0.95"/>
                  
                  {/* AI brain circuit pattern */}
                  <circle cx="14" cy="12" r="2" fill="#3B82F6" fillOpacity="0.8"/>
                  <circle cx="22" cy="12" r="2" fill="#8B5CF6" fillOpacity="0.8"/>
                  <circle cx="18" cy="16" r="1.5" fill="#6366F1" fillOpacity="0.8"/>
                  
                  {/* Neural network connections */}
                  <path d="M16 12L18 14.5M20 12L18 14.5M18 14.5L18 18" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" fillOpacity="0.6"/>
                  
                  {/* Quote/dollar symbol */}
                  <path d="M12 18C12 18 13 17 14 17C15 17 15.5 17.5 15.5 18C15.5 18.5 15 19 14 19H13.5" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                  <path d="M20.5 18C20.5 18 21.5 17 22.5 17C23.5 17 24 17.5 24 18C24 18.5 23.5 19 22.5 19H22" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              {/* Floating AI indicator */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.5 4.5L11 6L7.5 7.5L6 11L4.5 7.5L1 6L4.5 4.5L6 1Z" fill="white"/>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-tr from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
              AI-Powered Quoting Assistant
            </h1>
          </div>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 text-center max-w-2xl">
            Give your customers instant, accurate quotes using AI that knows your exact pricing and services.
          </p>
        </header>

        {/* Authentication Section */}
        <SignedOut>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-8 text-center border border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Get Started Today
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
              Create your account and set up your AI quoting assistant in minutes. 
              Your customers will love getting instant, accurate quotes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignUpButton mode="modal">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Create Free Account
                </button>
              </SignUpButton>
              <span className="text-gray-400 dark:text-gray-500">or</span>
              <SignInButton mode="modal">
                <button className="px-8 py-3 border-2 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 mb-8 text-center border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-green-600 dark:text-green-300 mb-4">
              You&apos;re all set up. Go to your dashboard to manage files and share your quote page.
            </p>
            <Link 
              href="/dashboard"
              className="inline-block px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </SignedIn>

        {/* How it Works Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Business Owners */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                📋 For Business Owners
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Sign Up & Log In</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Create your free account to get started</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Go to Dashboard</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Access your business management panel</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Upload Your Files</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Upload pricing lists, service menus, policies, or any business documents</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Share Your Quote Page</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Get your unique chat link and share it with customers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customers */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">
                💬 For Your Customers
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Visit Your Chat Page</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">No account needed - just click your shared link</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Describe Their Project</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Chat or speak to describe what they need</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Get Instant Quotes</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">AI provides accurate quotes based on your real pricing</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Connect Directly</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Ready to proceed? Contact you directly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
            Why Customers Love It
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Instant Quotes</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">No waiting - get accurate quotes immediately</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Voice & Text</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Speak or type - whatever feels natural</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💯</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Accurate Pricing</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Based on your real business data</p>
            </div>
          </div>
        </div>

        <SignedOut>
          {/* Final CTA */}
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Ready to Transform Your Quoting Process?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
              Join businesses already using AI to provide better customer experiences and close more deals.
            </p>
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg">
                Start Free Today
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
      </div>
    </main>
  );
}
