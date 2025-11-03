import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import type { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
}

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user as AuthUser | undefined;

  /**
   * Sign in with credentials
   */
  const login = useCallback(
    async (email: string, password: string, callbackUrl = "/dashboard") => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await signIn("credentials", {
          email: email.toLowerCase().trim(),
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
          return { success: false, error: result.error };
        }

        if (result?.ok) {
          router.push(callbackUrl);
          router.refresh();
          return { success: true };
        }

        return { success: false, error: "Sign in failed" };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  /**
   * Sign up a new user
   */
  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      address?: string;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            email: data.email.toLowerCase().trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMessage = result.error?.message || "Registration failed";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        // Auto sign in after registration
        const signInResult = await login(data.email, data.password);
        return signInResult;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  /**
   * Sign in with Google
   */
  const loginWithGoogle = useCallback((callbackUrl = "/dashboard") => {
    setIsLoading(true);
    signIn("google", { callbackUrl });
  }, []);

  /**
   * Sign out
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/auth/signin" });
  }, []);

  /**
   * Update session data
   */
  const refreshSession = useCallback(async () => {
    await update();
  }, [update]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user]
  );

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = status === "authenticated";

  /**
   * Check if session is loading
   */
  const isSessionLoading = status === "loading";

  return {
    // User data
    user,
    session,

    // Status
    isAuthenticated,
    isLoading: isLoading || isSessionLoading,
    error,

    // Actions
    login,
    register,
    loginWithGoogle,
    logout,
    refreshSession,

    // Helpers
    hasRole,
    isAdmin: hasRole(["ADMIN", "SUPER_ADMIN"]),
    isTechnician: hasRole("TECHNICIAN"),
    isCustomer: hasRole("CUSTOMER"),
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
