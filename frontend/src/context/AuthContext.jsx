import { createContext, useContext, useEffect, useState } from "react";

// ==========================================
// AUTH CONTEXT
// This acts like a global "store" that remembers if a user is logged in.
// Any component in the app can ask this context: "Who is logged in?"
// ==========================================

// 1. Create the empty context
const AuthContext = createContext(null);

// 2. Create the Provider (this wraps around our whole app in main.jsx)
export function AuthProvider({ children }) {
  
  // State to hold the digital ID card (token)
  // When the app first loads, we check if there's a token saved in localStorage
  const [token, setToken] = useState(() => {
    return localStorage.getItem("wms_token");
  });
  
  // State to hold the user's data (name, email, role, etc)
  const [user, setUser] = useState(() => {
    try {
      // Data is saved as a "string" in localStorage, so we parse it back into a JavaScript Object
      const savedUser = localStorage.getItem("wms_user");
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch (error) {
      return null;
    }
  });
  
  // State to track if we are still checking the user's login status
  const [loading, setLoading] = useState(true);
  
  // This runs exactly once when the app loads
  useEffect(() => {
    // We instantly finish loading because we got the data from localStorage above
    setLoading(false);
  }, []);
  
  // Function to run when a user successfully logs in
  const login = (payload, remember = true) => {
    // Save to our React state so the app updates immediately
    setToken(payload.token);
    setUser(payload.user);
    
    // Save to localStorage so they stay logged in even if they refresh the page
    localStorage.setItem("wms_token", payload.token);
    localStorage.setItem("wms_user", JSON.stringify(payload.user));
    
    // Handle the "Remember Me" checkbox logic
    if (!remember) {
      localStorage.setItem("wms_session_only", "1");
    } else {
      localStorage.removeItem("wms_session_only");
    }
  };
  
  // Function to run when a user clicks logout
  const logout = () => {
    // Clear our React state
    setToken(null);
    setUser(null);
    
    // Remove their data from localStorage completely
    localStorage.removeItem("wms_token");
    localStorage.removeItem("wms_user");
    localStorage.removeItem("wms_session_only");
  };
  
  // Function to run if the user changes their profile (like their name or picture)
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("wms_user", JSON.stringify(updatedUserData));
  };
  
  // Provide all these values and functions to the rest of the app
  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Create a Custom Hook
// This makes it super easy for other files to use our AuthContext.
// They just type: const { user, login } = useAuth();
export const useAuth = () => useContext(AuthContext);
