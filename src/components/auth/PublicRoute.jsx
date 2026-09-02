import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wraps public-only routes (/, /login, /register, /forgot-password).
 * If the user is already logged in, redirect them to /home (or wherever
 * they originally came from).
 */
export default function PublicRoute({ children }) {
  const { isAuthenticated, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f2]">
        <div className="h-10 w-10 rounded-full border-4 border-emerald-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect back to where they were going, or /home
    const destination = location.state?.from?.pathname || "/home";
    return <Navigate to={destination} replace />;
  }

  return children;
}
