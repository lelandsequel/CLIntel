import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();

  useEffect(() => {
    // If there's an error or no user after loading, redirect to login
    if (!isLoading && (!user || error)) {
      window.location.href = getLoginUrl();
    }
  }, [user, isLoading, error]);

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

