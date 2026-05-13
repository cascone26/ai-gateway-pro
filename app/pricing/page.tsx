import { SignUpButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";

export default async function Pricing() {
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
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            {!userId && (
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Sign Up
                </button>
              </SignUpButton>
            )}
          </div>
        </div>
      </nav>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <p className="text-gray-600 mb-6">Perfect to get started</p>
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">$0</p>
              <p className="text-gray-600 text-sm">forever</p>
            </div>
            <p className="text-gray-900 font-semibold mb-6">50 requests / day</p>
            <p className="text-gray-600 text-sm mb-8">
              That's ~1,500 requests per month
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Full API access</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Usage dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Community support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 font-bold">✗</span>
                <span className="text-gray-500">Priority support</span>
              </li>
            </ul>
            {userId ? (
              <button disabled className="w-full bg-gray-200 text-gray-600 px-6 py-3 rounded-lg font-semibold cursor-not-allowed">
                Currently Active
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button className="w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">
                  Get Started
                </button>
              </SignUpButton>
            )}
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-blue-600 rounded-lg p-8 bg-blue-50 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
            <p className="text-gray-600 mb-6">For professional use</p>
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">$9</p>
              <p className="text-gray-600 text-sm">per month</p>
            </div>
            <p className="text-gray-900 font-semibold mb-6">10,000 requests / month</p>
            <p className="text-gray-600 text-sm mb-8">
              That's ~333 requests per day. Cancel anytime.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Full API access</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Usage dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">Priority email support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">10x higher request limit</span>
              </li>
            </ul>
            {userId ? (
              <CheckoutButton />
            ) : (
              <SignUpButton mode="modal">
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                  Start Free Trial
                </button>
              </SignUpButton>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Yes. Changes take effect immediately on your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my request limit?
              </h3>
              <p className="text-gray-600">
                Free plan: rate limited. Pro plan: we'll contact you about upgrading.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                Yes, 30-day money-back guarantee. No questions asked.
              </p>
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
