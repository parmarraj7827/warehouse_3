// ==========================================
// STAT CARD COMPONENT
// A reusable small dashboard card that shows a single statistic (e.g., "Total Products: 50")
// ==========================================
export default function StatCard({
  label,      // Small title at the top (e.g., "Total Users")
  value,      // The big number (e.g., "1,200")
  icon: Icon, // The lucide-react icon component to display
  iconClass = "bg-blue-50 text-blue-600", // Colors for the icon background
  sub,        // Optional subtitle text at the bottom
  action,     // Optional button or action link
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        
        {/* Left Side: The Text Data */}
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          
          {/* If they passed a 'sub' text, render it */}
          {sub && <p className="mt-1 text-[11px] text-slate-400">{sub}</p>}
          
          {/* If they passed an 'action' button, render it */}
          {action}
        </div>
        
        {/* Right Side: The Icon */}
        {/* If an Icon was passed in, render it inside a colored box */}
        {Icon && (
          <div className={`rounded-lg p-2.5 ${iconClass}`}>
            <Icon size={19} />
          </div>
        )}
        
      </div>
    </div>
  );
}
