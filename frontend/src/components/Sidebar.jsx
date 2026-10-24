import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserRound,
  LogOut,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  UsersRound,
  Sparkles,
  ShieldAlert,
  Boxes
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const userItems = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/products", "Products", Package],
  ["/inventory", "Inventory", Boxes],
  ["/purchase-requests", "Purchase Requests", ShoppingCart],
  ["/profile", "Profile", UserRound],
];

const adminItems = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/products", "Products", Package],
  ["/admin/stock-in", "Stock In", ArrowDownToLine],
  ["/admin/stock-out", "Stock Out", ArrowUpFromLine],
  ["/admin/low-stock", "Low Stock", AlertTriangle],
  ["/admin/purchase-requests", "Purchase Requests", ShoppingCart],
  ["/admin/users", "Users", UsersRound],
  ["/admin/profile", "Profile", UserRound],
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const nav = isAdmin ? adminItems : userItems;
  const navigate = useNavigate();
  
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 block" : "opacity-0 hidden"
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-[#0b1120] via-[#0f172a] to-[#090d16] text-slate-100 shadow-2xl transition-all duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800/80 px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <Boxes className="h-5 w-5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-lg font-bold tracking-tight text-white">NexWMS</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <span className="inline-block rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-blue-400 ring-1 ring-blue-500/20">
                {isAdmin ? "ADMIN CONTROL" : "STAFF PORTAL"}
              </span>
            </div>
          </div>
          
          <button 
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Navigation Menu
            </p>
            <nav className="mt-3 space-y-1.5">
              {nav.map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/admin" || to === "/dashboard"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-blue-600/25 backdrop-blur-md"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-glow" />
                      )}
                      <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                      }`} />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-900/60 p-3 ring-1 ring-slate-800/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="User" className="h-full w-full rounded-lg object-cover" />
              ) : (
                user?.name?.slice(0, 1).toUpperCase() || "U"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{user?.name || "User"}</p>
              <p className="truncate text-[10px] text-slate-400">{user?.email || ""}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 py-2.5 text-xs font-semibold text-slate-300 transition-all duration-200 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

