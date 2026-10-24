import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ==========================================
// PROTECTED ROUTE COMPONENT
// This is a security guard for our URLs!
// It wraps around pages to stop unauthorized people from seeing them.
// ==========================================
export default function ProtectedRoute({ role }) {
  // Get the current user and check if the app is still loading their data
  const { user, loading } = useAuth();
  
  // Get the current URL they are trying to visit
  const loc = useLocation();
  
  // 1. If we are still checking their login token, show a loading screen
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">
        Loading...
      </div>
    );
  }
    
  // 2. If nobody is logged in, kick them out to the Login page!
  // We use `state={{ from: loc.pathname }}` to remember where they were trying to go,
  // so we can send them back there after they log in.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
    
  // 3. If a specific 'role' is required (e.g., 'admin'), check if they match!
  if (role && user.role !== role) {
    // If they don't match, send them to their own dashboard
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
    
  // 4. If they passed all security checks, let them see the page!
  // <Outlet /> renders whatever page they were trying to visit.
  return <Outlet />;
}
