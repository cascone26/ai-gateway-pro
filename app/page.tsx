import { SignUpButton, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">
            <Link href="/">AI Gateway Pro</Link>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            {userId ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-gray-600 hover:text-gray-900">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Multi-Provider AI Gateway
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            One API key. 8 providers. Automatic fallback. Pay only for what you use.
          </p>
          <div className="flex justify-center gap-4">
            {!userId ? (
              <>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                    Get Started Free
                  </button>
                </SignUpButton>
                <Link href="/pricing">
                  <button className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300">
                    View Plans
                  </button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                  Go to Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Multiple Providers
            </h3>
            <p className="text-gray-600">
              Access Bedrock, Gemini, Cerebras, Groq, OpenRouter, GitHub Models,
              and Ollama from one endpoint.
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Automatic Fallback
            </h3>
            <p className="text-gray-600">
              If one provider fails, we automatically try the next one in the
              chain. Your requests never fail.
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Usage Tracking
            </h3>
            <p className="text-gray-600">
              Real-time usage dashboard. Never surprise bills. Pay only for what
              you use.
            </p>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">$0/mo</p>
              <p className="text-gray-600 mb-6">50 requests / day</p>
              <Link href="/pricing">
                <button className="w-full bg-gray-200 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">
                  Get Started
                </button>
              </Link>
            </div>
            <div className="p-8 border-2 border-blue-600 rounded-lg bg-blue-50">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">$9/mo</p>
              <p className="text-gray-600 mb-6">10,000 requests / month</p>
              {!userId ? (
                <SignUpButton mode="modal">
                  <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                    Start Free Trial
                  </button>
                </SignUpButton>
              ) : (
                <Link href="/pricing">
                  <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                    Upgrade Now
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2026 AI Gateway Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
