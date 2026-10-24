import { CheckCircle2, XCircle, X } from "lucide-react";

// ==========================================
// TOAST NOTIFICATION COMPONENT
// A small pop-up alert that slides in from the top right.
// Used to show success ("Saved!") or error ("Failed!") messages.
// ==========================================
export default function Toast({ toast, onClose }) {
  // If there is no toast message to show, render nothing
  if (!toast) return null;
  
  // Determine if this is a success message or an error message
  const isSuccess = toast.type !== "error";
  
  return (
    // Fixed positioning puts it floating in the top right corner
    <div className="fixed right-4 top-4 z-[100] w-[min(360px,calc(100vw-2rem))] rounded-xl border border-slate-100 bg-white p-4 shadow-2xl">
      <div className="flex gap-3">
        
        {/* 1. Icon (Green Checkmark OR Red X) */}
        <div className={isSuccess ? "text-emerald-500" : "text-red-500"}>
          {isSuccess ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
        </div>
        
        {/* 2. Text Content */}
        <div className="min-w-0 flex-1">
          {/* Title: If they didn't provide one, default to 'Success' or 'Error' */}
          <p className="text-sm font-semibold text-slate-900">
            {toast.title || (isSuccess ? "Success" : "Error")}
          </p>
          {/* Message Description */}
          <p className="mt-1 text-sm text-slate-500">{toast.message}</p>
        </div>
        
        {/* 3. Close Button */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700"
        >
          <X size={17} />
        </button>
        
      </div>
    </div>
  );
}
