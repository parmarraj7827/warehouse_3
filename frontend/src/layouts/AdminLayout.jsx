import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// ==========================================
// ADMIN LAYOUT
// This acts as a "frame" for all admin pages.
// It keeps the Sidebar and Navbar on the screen, 
// while the content in the middle changes.
// ==========================================
export default function AdminLayout() {
  // State to control if the mobile sidebar is open or closed
  const [open, setOpen] = useState(false);
  
  return (
    // The main container that fills the entire screen
    <div className="flex min-h-screen bg-[#f7faff]">
      
      {/* 1. The Sidebar (Left Navigation) */}
      {/* We pass 'open' to tell it if it should be visible on mobile */}
      <Sidebar open={open} onClose={() => setOpen(false)} />
      
      {/* 2. The Main Content Area (Takes up the rest of the screen) */}
      <div className="flex min-w-0 flex-1 flex-col">
        
        {/* The Top Navigation Bar */}
        <Navbar onMenu={() => setOpen(true)} />
        
        {/* The actual page content goes here! */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* <Outlet /> is a special React Router component. 
              It acts as a placeholder where child pages (like Dashboard or Products) are injected. */}
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}
