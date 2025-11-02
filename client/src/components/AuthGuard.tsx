import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();
  const [authBypass, setAuthBypass] = useState(false);

  // Check if OAuth is configured
  const oauthConfigured = import.meta.env.VITE_OAUTH_PORTAL_URL && import.meta.env.VITE_APP_ID;

  useEffect(() => {
    // If OAuth is not configured, bypass authentication in development
    if (!oauthConfigured) {
      console.warn('[AuthGuard] OAuth not configured - bypassing authentication');
      setAuthBypass(true);
      return;
    }

    // If there's an error or no user after loading, redirect to login
    if (!isLoading && (!user || error)) {
      window.location.href = getLoginUrl();
    }
  }, [user, isLoading, error, oauthConfigured]);

  // Bypass auth if OAuth is not configured
  if (authBypass) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect)
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

