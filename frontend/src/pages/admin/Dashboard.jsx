import { useQuery, ADMIN_STATS, TRANSACTIONS } from "../../services/backend";
import { 
  Package, 
  Boxes, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  AlertTriangle, 
  Plus, 
  TrendingUp, 
  ArrowRight,
  Activity,
  Zap,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data, loading } = useQuery(ADMIN_STATS, {
    pollInterval: 15000,
  });

  const { data: tx } = useQuery(TRANSACTIONS, {
    variables: { type: null },
  });

  const s = data?.adminDashboardStats || {};

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl ring-1 ring-white/10">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-10 right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Warehouse Analytics</span>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Administrator Dashboard
            </h1>
            <p className="max-w-xl text-sm text-slate-300">
              Monitor inventory levels, track daily movements, and manage stock allocations across your warehouse.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </Link>

            <Link
              to="/admin/stock-in"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5"
            >
              <ArrowDownToLine size={16} />
              <span>Stock In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          to="/admin/products"
          label="Total Products"
          value={loading ? "—" : s.totalProducts}
          subtext="Active SKUs catalog"
          icon={Package}
          accentColor="from-blue-600 to-indigo-600"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200/60"
        />

        <StatCard
          to="/admin/products"
          label="Total Stock"
          value={loading ? "—" : s.totalStock?.toLocaleString()}
          subtext="Items in warehouse"
          icon={Boxes}
          accentColor="from-emerald-600 to-teal-600"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200/60"
        />

        <StatCard
          to="/admin/stock-in"
          label="Stock In Today"
          value={loading ? "—" : s.stockInToday}
          subtext="Incoming shipments"
          icon={ArrowDownToLine}
          accentColor="from-amber-500 to-orange-600"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200/60"
        />

        <StatCard
          to="/admin/stock-out"
          label="Stock Out Today"
          value={loading ? "—" : s.stockOutToday}
          subtext="Dispatched items"
          icon={ArrowUpFromLine}
          accentColor="from-violet-600 to-purple-600"
          badgeColor="bg-violet-50 text-violet-700 border-violet-200/60"
        />

        <StatCard
          to="/admin/low-stock"
          label="Low Stock Alerts"
          value={loading ? "—" : s.lowStockProducts}
          subtext="Requires reorder"
          icon={AlertTriangle}
          accentColor="from-rose-600 to-red-600"
          badgeColor="bg-rose-50 text-rose-700 border-rose-200/60"
          alert={s.lowStockProducts > 0}
        />
      </div>

      {/* Main Grid: Inventory Breakdown & Live Feed */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        
        {/* Left Side: Stock Summary Visualizer */}
        <section className="card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">Inventory Health Breakdown</h2>
              <p className="text-xs text-slate-500">Overview of current stock status distribution</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-[180px_1fr] items-center">
            {/* Visual Conic Donut Ring */}
            <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full p-3 shadow-inner"
              style={{
                background: "conic-gradient(#2563eb 0% 68%, #f59e0b 68% 86%, #ef4444 86% 100%)",
              }}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center shadow-lg backdrop-blur-md">
                <span className="font-heading text-3xl font-extrabold text-slate-900">
                  {s.totalStock || 0}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Items</span>
              </div>
            </div>

            {/* Legend & Health Bars */}
            <div className="space-y-4">
              <LegendItem 
                color="bg-blue-600" 
                label="Normal Stock" 
                desc="Healthy stock count"
                value={`${Math.max(0, (s.totalProducts || 0) - (s.lowStockProducts || 0))} products`}
              />
              <LegendItem 
                color="bg-amber-500" 
                label="Low Stock Warning" 
                desc="Below threshold level"
                value={`${s.lowStockProducts || 0} products`}
              />
              <LegendItem 
                color="bg-rose-500" 
                label="Stock Out Risk" 
                desc="Requires immediate action"
                value={s.lowStockProducts > 0 ? "Attention Needed" : "Optimal"}
              />
            </div>
          </div>
        </section>

        {/* Right Side: Activity Log Feed */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">Live Activity Feed</h2>
              <p className="text-xs text-slate-500">Real-time stock IN / OUT transactions</p>
            </div>
            <Link to="/admin/stock-in" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(tx?.stockTransactions || []).slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50/80">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  t.type === "IN" 
                    ? "bg-amber-50 text-amber-600 border-amber-200/60" 
                    : "bg-violet-50 text-violet-600 border-violet-200/60"
                }`}>
                  {t.type === "IN" ? <ArrowDownToLine size={18} /> : <ArrowUpFromLine size={18} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {t.product?.productName || "Inventory Item"}
                    </p>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      t.type === "IN" ? "bg-amber-50 text-amber-700" : "bg-violet-50 text-violet-700"
                    }`}>
                      {t.type === "IN" ? "+ " + t.quantity : "- " + t.quantity} units
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-500 truncate">
                    {t.type === "IN" ? `Supplier: ${t.supplier || "Standard Supplier"}` : `Customer: ${t.customer || "User Request"}`}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {new Date(t.date).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))}

            {!tx?.stockTransactions?.length && (
              <div className="p-12 text-center text-slate-400 text-xs">
                No transaction records available.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, icon: Icon, accentColor, badgeColor, to, alert }) {
  return (
    <Link
      to={to}
      className={`group relative card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        alert ? "ring-2 ring-rose-500/50" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="font-heading text-2xl font-extrabold text-slate-900">{value}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${accentColor} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[11px] font-medium text-slate-400">{subtext}</span>
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${badgeColor}`}>
          Explore <ArrowRight size={10} />
        </span>
      </div>
    </Link>
  );
}

function LegendItem({ color, label, desc, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50/50">
      <div className="flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <div>
          <p className="text-xs font-bold text-slate-800">{label}</p>
          <p className="text-[10px] text-slate-400">{desc}</p>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}

