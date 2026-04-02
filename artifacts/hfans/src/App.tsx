import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MiniKitProvider } from "@/components/MiniKitProvider";
import { useAuthStore } from "@/store/use-auth-store";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { AuthScreen } from "@/pages/auth";
import Home from "@/pages/home";
import Explore from "@/pages/explore";
import CreatorProfile from "@/pages/creator-profile";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import CreatePost from "@/pages/create-post";
import BecomeCreator from "@/pages/become-creator";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, [setUser]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/creator/:username" component={CreatorProfile} />
      <Route path="/messages" component={Messages} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/create-post" component={CreatePost} />
      <Route path="/become-creator" component={BecomeCreator} />
      <Route path="/creator-dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MiniKitProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthWrapper>
              <Router />
            </AuthWrapper>
          </WouterRouter>
        </MiniKitProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
