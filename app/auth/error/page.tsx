import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthErrorPageProps {
  searchParams?: {
    error?: string;
  };
}

const ERROR_COPY: Record<string, { title: string; description: string }> = {
  AccessDenied: {
    title: "Access denied",
    description:
      "You do not have permission to sign in with that account. Try a different account or contact support.",
  },
  CredentialsSignin: {
    title: "Invalid credentials",
    description: "The email or password you entered is incorrect.",
  },
  Configuration: {
    title: "Configuration issue",
    description:
      "Authentication is temporarily unavailable. Please try again shortly.",
  },
  Default: {
    title: "We couldn't sign you in",
    description:
      "Something went wrong during authentication. Please try again or use a different sign-in method.",
  },
  OAuthSignin: {
    title: "Unable to sign in",
    description: "We were unable to connect to the provider. Please try again.",
  },
  OAuthCallback: {
    title: "Unable to sign in",
    description:
      "We were unable to complete the sign-in process. Please try again.",
  },
  SessionRequired: {
    title: "Sign-in required",
    description: "Please sign in to continue.",
  },
  Verification: {
    title: "Link expired",
    description: "The verification link has expired or has already been used.",
  },
};

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const errorKey = searchParams?.error?.toString() ?? "Default";
  const copy = ERROR_COPY[errorKey] ?? ERROR_COPY.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md p-8 text-center shadow-xl space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            {copy.title}
          </h1>
          <p className="text-muted-foreground text-sm">{copy.description}</p>
        </div>

        <div className="space-y-2">
          <Link href="/auth/signin" className="block">
            <Button className="w-full bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600">
              Try signing in again
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Go back home
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Still having trouble? Reach out to our support team at{" "}
          <a
            href="mailto:support@servixing.com"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            support@servixing.com
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
