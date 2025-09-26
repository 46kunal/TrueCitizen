import { useState, useEffect } from "react";
import { SplashScreen } from "../components/SplashScreen";
import { AuthScreen } from "../components/screens/AuthScreen";
import { HomeScreen } from "../components/screens/HomeScreen";
import { ReportScreen } from "../components/screens/ReportScreen";
import { TrackScreen } from "../components/screens/TrackScreen";
import { CommunityScreen } from "../components/screens/CommunityScreen";
import { ProfileScreen } from "../components/screens/ProfileScreen";
import { MobileLayout } from "../components/layout/MobileLayout";
import { supabase } from "@/supabase"; // Import supabase client
import { Session } from "@supabase/supabase-js";

type AppState = "splash" | "auth" | "home" | "report" | "track" | "community" | "profile";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("splash");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackFilter, setTrackFilter] = useState<'reported' | 'resolved' | undefined>(undefined);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        setAppState('home');
      } else {
        setAppState('auth');
      }
    });

    // Listen for auth state changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        setAppState('home');
      }
      if (_event === 'SIGNED_OUT') {
        setAppState('auth');
      }
    });

    // Expose a global function for navigation with a filter
    (window as any).setAppState = (state: AppState, options?: { filter?: 'reported' | 'resolved' }) => {
        setAppState(state);
        if (options?.filter) {
            setTrackFilter(options.filter);
        } else {
            setTrackFilter(undefined);
        }
    };


    return () => subscription.unsubscribe();
  }, []);
  
  const handleSplashContinue = () => setAppState("auth");
  
  const handleNavigation = (route: AppState) => {
    // Only allow navigation if a session exists, protecting all other routes
    if (session || route === 'auth' || route === 'splash') {
      setAppState(route);
    }
  };
  
  if (loading) return <SplashScreen onContinue={() => {}} />;
  if (appState === "splash") return <SplashScreen onContinue={handleSplashContinue} />;

  // Render the protected screens if a session exists, otherwise show AuthScreen
  const renderScreen = () => {
    if (!session) return <AuthScreen />;
    
    switch (appState) {
      case "report": return <ReportScreen onNavigate={handleNavigation} />;
      case "track": return <TrackScreen filter={trackFilter} />;
      case "community": return <CommunityScreen />;
      case "profile": return <ProfileScreen />;
      default: return <HomeScreen onNavigate={handleNavigation} />;
    }
  };

  return (
    <MobileLayout activeTab={appState} onNavigate={(tab) => handleNavigation(tab as AppState)}>
      {renderScreen()}
    </MobileLayout>
  );
};

export default Index;