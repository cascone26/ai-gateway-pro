import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get user info
  const { data: user } = await supabase
    .from("aigw_users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user) {
    redirect("/");
  }

  // Get API keys
  const { data: keys } = await supabase
    .from("aigw_api_keys")
    .select("*")
    .eq("user_id", userId)
    .is("revoked_at", null);

  // Get current month usage
  const now = new Date();
  const month_year = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const { data: usage } = await supabase
    .from("aigw_usage")
    .select("request_count")
    .eq("user_id", userId)
    .eq("month_year", month_year)
    .single();

  const requestCount = usage?.request_count || 0;
  const limit = user.plan === "pro" ? 10000 : 50 * 30; // ~1500/month for free
  const percentUsed = Math.round((requestCount / limit) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">
            <Link href="/">AI Gateway Pro</Link>
          </div>
          <UserButton />
        </div>
      </nav>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Plan Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.plan === "pro" ? "Pro Plan" : "Free Plan"}
              </h2>
              <p className="text-gray-600 mt-1">
                {user.plan === "pro"
                  ? "$9/month • 10,000 requests"
                  : "Free • 50 requests/day"}
              </p>
            </div>
            {user.plan === "free" && (
              <Link href="/pricing">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                  Upgrade to Pro
                </button>
              </Link>
            )}
          </div>

          {/* Usage Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-700">
                Monthly Usage ({month_year})
              </p>
              <p className="text-sm text-gray-600">
                {requestCount.toLocaleString()} / {limit.toLocaleString()} requests
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  percentUsed > 90
                    ? "bg-red-600"
                    : percentUsed > 70
                    ? "bg-yellow-500"
                    : "bg-green-600"
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {percentUsed}% used this month
            </p>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
            <button
              onClick={() => {
                // This will be replaced with actual key generation
                alert("Key generation endpoint not yet implemented");
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Generate Key
            </button>
          </div>

          {keys && keys.length > 0 ? (
            <div className="space-y-4">
              {keys.map((key: any) => (
                <div
                  key={key.key_id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {key.label || "Untitled Key"}
                      </p>
                      <p className="text-sm text-gray-600 font-mono mt-2">
                        sk_...{key.key_hash.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => alert("Revoke functionality coming soon")}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              No API keys yet.{" "}
              <button
                onClick={() => alert("Key generation not yet implemented")}
                className="text-blue-600 hover:underline"
              >
                Create one
              </button>
              .
            </p>
          )}
        </div>

        {/* API Documentation */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Start</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Endpoint</p>
              <code className="block bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {process.env.NEXT_PUBLIC_APP_URL}/api/v1/chat/completions
              </code>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Example Request</p>
              <code className="block bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap break-words">
                {`curl -X POST ${process.env.NEXT_PUBLIC_APP_URL}/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                See{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  full documentation
                </a>{" "}
                for more details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
