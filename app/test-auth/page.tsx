import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function TestAuthPage() {
  console.log("=== TEST AUTH PAGE ===");
  console.log("Environment check:");
  console.log("- NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
  console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  console.log("- NODE_ENV:", process.env.NODE_ENV);

  let session;
  let error;

  try {
    session = await getServerSession(authOptions);
    console.log("Session fetch successful:", !!session);
    if (session) {
      console.log("User:", session.user);
    }
  } catch (e) {
    error = e;
    console.error("Session fetch error:", e);
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>

        <div className="space-y-6">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Environment Variables
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <span className="text-muted-foreground">NEXTAUTH_SECRET: </span>
                <span
                  className={
                    process.env.NEXTAUTH_SECRET
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {process.env.NEXTAUTH_SECRET ? "✓ Set" : "✗ Not set"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">NEXTAUTH_URL: </span>
                <span>{process.env.NEXTAUTH_URL || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">NODE_ENV: </span>
                <span>{process.env.NODE_ENV}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                <p className="font-semibold">Error fetching session:</p>
                <pre className="mt-2 text-xs overflow-auto">
                  {error instanceof Error ? error.message : String(error)}
                </pre>
              </div>
            ) : session ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700 font-semibold mb-2">
                  ✓ Authenticated
                </p>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span>{session.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Name: </span>
                    <span>{session.user?.name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-700">No active session</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <a
              href="/auth/signin"
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Go to Sign In
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔍 TEST: Go to Dashboard
            </a>
            <a
              href="/api/auth/session"
              target="_blank"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              View Session API
            </a>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              📝 Instructions:
            </p>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Click "TEST: Go to Dashboard" button above</li>
              <li>Watch your terminal for logs</li>
              <li>
                If you see ERR_TOO_MANY_REDIRECTS, check the terminal logs
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
