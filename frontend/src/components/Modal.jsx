import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}) {
  if (!open) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm transition-all duration-300"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`max-h-[90vh] w-full ${
          wide ? "max-w-3xl" : "max-w-lg"
        } overflow-auto rounded-3xl bg-white/95 shadow-2xl ring-1 ring-slate-200/80 backdrop-blur-xl transition-all animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4.5 backdrop-blur-md">
          <h3 className="font-heading text-lg font-bold text-slate-900">{title}</h3>
          
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

