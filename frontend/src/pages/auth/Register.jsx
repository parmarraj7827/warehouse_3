import { useState } from "react";
import { useMutation, REGISTER } from "../../services/backend";
import { useNavigate } from "react-router-dom";
import { Package, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ==========================================
// REGISTER PAGE
// This component lets new users create an account.
// Note: Only standard "users" can register here. Admins must be created directly in the DB.
// ==========================================
export default function Register() {
  // --- STATE VARIABLES ---
  // Instead of creating 5 separate useStates (like we did for Login), 
  // we can store all the form data inside one Object! This is much cleaner.
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  
  // Controls showing/hiding the password dots
  const [show, setShow] = useState(false);
  
  // Stores error messages to display
  const [error, setError] = useState("");
  
  // --- HOOKS ---
  // Gets our register function that talks to the server
  const [register, { loading }] = useMutation(REGISTER);
  
  // Gets our function to save the user's login session
  const { login: save } = useAuth();
  
  // Allows us to redirect pages
  const navigate = useNavigate();

  // --- HELPER FUNCTION ---
  // This cleverly updates our 'form' state. 
  // e.target.name is the name of the input box (e.g., "email" or "password")
  // e.target.value is what they typed.
  const update = (e) => {
    // The "..." (spread operator) copies all existing data, 
    // then we overwrite just the one field that changed.
    setForm({ 
      ...form, 
      [e.target.name]: e.target.value 
    });
  };

  // --- FORM SUBMIT FUNCTION ---
  const submit = async (e) => {
    e.preventDefault();
    setError(""); // Clear old errors

    // 1. Basic Validation: Check for empty required fields
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    
    // 2. Validate Password Length
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    // 3. Confirm Passwords Match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // 4. Send the new user data to the backend
      const { data } = await register({
        variables: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null, // If phone is empty, send null
          password: form.password,
        },
      });

      // 5. Instantly log them in and save their token
      save(data.register, true);
      
      // 6. Send them to their new dashboard
      navigate("/dashboard", { replace: true });
      
    } catch (err) {
      // Clean up error from server (e.g., "Email already in use")
      setError(
        err?.message
          ?.replace("GraphQL error: ", "")
          .replace("ApolloError: ", "") || "Unable to create account.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faff] p-4 sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
          
          {/* =====================================================
              LEFT SIDE - WAREHOUSE IMAGE
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
              RIGHT SIDE - REGISTRATION FORM
          ====================================================== */}
          <div className="flex min-h-[680px] items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md">
              <div className="mb-7 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Package size={30} />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-blue-700">WMS</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Warehouse Management System
                </p>
              </div>
              
              <h2 className="text-center text-base font-bold text-slate-900">
                Create user account
              </h2>
              
              {/* Error Display */}
              {error && (
                <div className="mt-5 flex gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {/* Registration Form */}
              <form onSubmit={submit} className="mt-6 space-y-4">
                
                {/* Full Name */}
                <div>
                  <label className="label">Full Name</label>
                  <input
                    className="input"
                    name="name" // This name must match the key in our 'form' state object!
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={update} // Uses our helper function to update state
                    autoComplete="name"
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={update}
                    autoComplete="email"
                  />
                </div>
                
                {/* Phone (Optional) */}
                <div>
                  <label className="label">
                    Phone{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>
                  <input
                    className="input"
                    name="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={update}
                    autoComplete="tel"
                  />
                </div>
                
                {/* Password */}
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      className="input pr-10"
                      type={show ? "text" : "password"}
                      name="password"
                      placeholder="Create a password"
                      value={form.password}
                      onChange={update}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    className="input"
                    type={show ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={update}
                    autoComplete="new-password"
                  />
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? "Creating account..." : "Create Account"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>
              
              {/* Back to Login Link */}
              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
              
              <p className="mt-2 text-center text-xs text-slate-400">
                Registration is available for user accounts only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
