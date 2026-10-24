import { useState } from "react";
import { useMutation, LOGIN } from "../../services/backend";
import { useNavigate } from "react-router-dom";
import { Package, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

// Import our custom AuthContext to save the user's login state
import { useAuth } from "../../context/AuthContext";

// ==========================================
// LOGIN PAGE
// This component displays the login form and handles sending the 
// email/password to the backend for verification.
// ==========================================
export default function Login() {
  // --- STATE VARIABLES ---
  // We use useState to keep track of what the user types into the input boxes.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Controls whether the password is shown as text or hidden behind dots
  const [show, setShow] = useState(false);
  
  // Keeps track of the "Remember Me" checkbox
  const [remember, setRemember] = useState(true);
  
  // Stores any error messages to show the user (like "Wrong password")
  const [error, setError] = useState("");

  // --- HOOKS ---
  // useMutation is our custom hook (from backend.js) that talks to the server
  // It gives us a 'login' function to call, and a 'loading' variable so we know when to show a spinner
  const [login, { loading }] = useMutation(LOGIN);

  // useAuth gives us the 'save' function (which we renamed from 'login' to avoid confusion)
  // This saves the digital ID card in localStorage after a successful login
  const { login: save } = useAuth();
  
  // useNavigate lets us redirect the user to a different page (like the dashboard)
  const navigate = useNavigate();

  // --- FORM SUBMIT FUNCTION ---
  // This runs when the user clicks the "Sign In" button
  const submit = async (e) => {
    // Prevent the default browser behavior of refreshing the entire page
    e.preventDefault();
    
    // Clear any previous error messages
    setError("");

    // 1. Basic Validation: Make sure they typed something!
    if (!email || !password) {
      setError("Please enter your email and password.");
      return; // Stop the function here
    }

    try {
      // 2. Send the request to the backend
      // We wait for the server to check the email and password
      const { data } = await login({
        variables: {
          email: email,
          password: password,
        },
      });

      // 3. Check if the server actually sent back a login token
      if (!data?.login) {
        setError("Unable to sign in.");
        return;
      }

      // 4. Save authentication information (the token and user data) to the browser
      save(data.login, remember);

      // 5. Redirect the user to the correct page based on their role
      if (data.login.user.role === "admin") {
        // Admins go to the admin dashboard
        navigate("/admin", { replace: true });
      } else {
        // Normal users go to the user dashboard
        navigate("/dashboard", { replace: true });
      }
      
    } catch (err) {
      // If the backend threw an error (like "Invalid password")
      console.error("Login error:", err);

      // Clean up the error message text so it looks nice for the user
      const message =
        err?.message
          ?.replace("GraphQL error: ", "")
          ?.replace("ApolloError: ", "") ||
        "Unable to sign in. Please check your credentials.";

      // Display the error on the screen
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faff] p-4 sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
          
          {/* =====================================================
              LEFT SIDE - WAREHOUSE IMAGE (Hidden on mobile)
          ====================================================== */}
          <div className="relative hidden min-h-[680px] overflow-hidden bg-[#dceeff] lg:block">
            <img
              src="/warehouse.svg"
              alt="Warehouse"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d2d50]/60 to-transparent p-8">
              <p className="text-sm font-medium text-white/90">
                Smart inventory. Simple operations.
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Warehouse Management System
              </h2>
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE - LOGIN FORM
          ====================================================== */}
          <div className="flex min-h-[680px] items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md">
              
              {/* --- Logo & Heading --- */}
              <div className="mb-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Package size={30} />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-blue-700">WMS</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Warehouse Management System
                </p>
              </div>

              <h2 className="text-center text-base font-bold text-slate-900">
                Sign in to your account
              </h2>

              {/* --- Error Message Display --- */}
              {error && (
                <div className="mt-5 flex gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* --- The Form --- */}
              {/* onSubmit={submit} means when they press Enter or click the button, run our submit function */}
              <form onSubmit={submit} className="mt-6 space-y-5">
                
                {/* Email Input */}
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="Enter your email"
                    // Connect the input box to our 'email' state variable
                    value={email}
                    // Every time they type a letter, update the state!
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      className="input pr-10"
                      // If 'show' is true, show text. If false, show dots (password)
                      type={show ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />

                    {/* Show/Hide Password Toggle Button */}
                    <button
                      type="button"
                      // Clicking this flips 'show' from true to false (or false to true)
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Checkbox and Forgot Password Link */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setError("For local demo, use the seeded account credentials.")
                    }
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  // If 'loading' is true (waiting for server), disable the button so they can't click it twice
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {/* Change the text based on whether it is loading */}
                  {loading ? "Signing in..." : "Sign In"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              {/* Link to Register Page */}
              <p className="mt-6 text-center text-sm text-slate-500">
                New user?{" "}
                <button
                  type="button"
                  // Go to the registration page without refreshing the browser
                  onClick={() => navigate("/register")}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
