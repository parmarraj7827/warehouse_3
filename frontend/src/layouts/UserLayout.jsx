import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// ==========================================
// USER LAYOUT
// This acts as a "frame" for all user pages.
// It is exactly the same as AdminLayout, but we keep them 
// separate in case we want to make them look different later.
// ==========================================
export default function UserLayout() {
  // State to control if the mobile sidebar is open or closed
  const [open, setOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-[#f7faff]">
      
      {/* The Sidebar (Left Navigation) */}
      <Sidebar open={open} onClose={() => setOpen(false)} />
      
      {/* The Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        
        {/* The Top Navigation Bar */}
        <Navbar onMenu={() => setOpen(true)} />
        
        {/* The actual page content goes here! */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* <Outlet /> acts as a placeholder where child pages are injected */}
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}
