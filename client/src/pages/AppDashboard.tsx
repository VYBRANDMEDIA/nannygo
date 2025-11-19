import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { LogOut, User } from "lucide-react";

export default function AppDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();



  useEffect(() => {
    // Don't do anything while loading
    if (authLoading) return;

    // Not logged in - redirect to home
    if (!user) {
      setLocation("/");
      return;
    }

    // User logged in but no profile - redirect to onboarding
    if (!profile) {
      setLocation("/onboarding");
      return;
    }

    // User has profile - redirect based on role
    if (profile.role === "parent") {
      setLocation("/app/parent");
    } else if (profile.role === "nanny") {
      setLocation("/app/nanny");
    } else if (profile.role === "admin") {
      setLocation("/app/admin");
    }
  }, [user, profile, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <img src={APP_LOGO} alt="NannyGo" className="h-20 mx-auto mb-4" />
        <p className="text-muted-foreground">Doorverwijzen...</p>
      </div>
    </div>
  );
}
