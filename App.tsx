
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider } from "@/context/AppProvider";
import { useApp } from "@/context/AppContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Schedule from "./pages/Schedule";
import Statistics from "./pages/Statistics";
import WalkTracking from "./pages/WalkTracking";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import DogProfile from "./pages/DogProfile";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// Create the query client outside of component rendering
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Authentication wrapper component
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { state, isLoading } = useApp();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!state.isRegistered) {
    // Redirect to landing with the intended path for potential redirect after login
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  
  return <>{children}</>;
};

// Redirect to home if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { state, isLoading } = useApp();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (state.isRegistered) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  // Force re-mounting of the Routes component when auth state changes
  const [key, setKey] = useState(0);
  const { state } = useApp();
  
  useEffect(() => {
    // Update key when auth state changes to force re-mount
    setKey(prevKey => prevKey + 1);
  }, [state.isRegistered]);
  
  return (
    <BrowserRouter>
      <Routes key={key}>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/home" element={<AuthRoute><Index /></AuthRoute>} />
        <Route path="/schedule" element={<AuthRoute><Schedule /></AuthRoute>} />
        <Route path="/statistics" element={<AuthRoute><Statistics /></AuthRoute>} />
        <Route path="/walk-tracking" element={<AuthRoute><WalkTracking /></AuthRoute>} />
        <Route path="/notifications" element={<AuthRoute><Notifications /></AuthRoute>} />
        <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>} />
        <Route path="/profile" element={<AuthRoute><UserProfile /></AuthRoute>} />
        <Route path="/dog-profile" element={<AuthRoute><DogProfile /></AuthRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
