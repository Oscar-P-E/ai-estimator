import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
// import TestSpeech from './components/TestSpeech';

export default function Home() {
  return (
    <main className="flex-1 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <div className="w-full max-w-4xl mx-auto my-4 sm:my-6 p-4 sm:p-6 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800">
        <header className="flex flex-col items-center mb-8">
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
