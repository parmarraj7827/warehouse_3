import { Menu, Bell, Shield, User, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenu }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 sm:px-8 backdrop-blur-md transition-all">
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Operational</span>
        </div>
      </div>

      {/* Right Side Tools & User Profile */}
      <div className="flex items-center gap-4">
        {/* Today's Date */}
        <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{todayStr}</span>
        </div>

        {/* User Role Tag */}
        <div className={`hidden sm:inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold ${
          isAdmin 
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ring-1 ring-blue-500/20" 
            : "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 ring-1 ring-slate-300/40"
        }`}>
          {isAdmin ? <Shield className="h-3.5 w-3.5 text-blue-600" /> : <User className="h-3.5 w-3.5 text-slate-500" />}
          <span className="capitalize">{user?.role || "Staff"}</span>
        </div>

        {/* Avatar Ring */}
        <div className="flex items-center gap-3 border-l border-slate-200/80 pl-4">
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20 ring-2 ring-white">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.slice(0, 1).toUpperCase() || "U"
              )}
            </div>
          </div>

          <div className="hidden text-left sm:block">
            <p className="font-heading text-xs font-bold text-slate-900 leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] font-medium text-slate-400">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

