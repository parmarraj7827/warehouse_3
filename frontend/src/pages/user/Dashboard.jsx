import { useQuery, USER_STATS, MY_REQUESTS, INVENTORY } from "../../services/backend";
import { ClipboardList, CheckCircle2, Clock3, Boxes, ArrowRight, Plus, Package, MapPin, Tag, AlertTriangle, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Badge = ({ status }) => {
  if (status === "APPROVED") {
    return <span className="badge-emerald"><CheckCircle2 className="h-3 w-3" /> APPROVED</span>;
  }
  if (status === "PENDING") {
    return <span className="badge-amber"><Clock3 className="h-3 w-3" /> PENDING</span>;
  }
  return <span className="badge-rose">REJECTED</span>;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, loading: s } = useQuery(USER_STATS);
  const { data: reqs, loading: r } = useQuery(MY_REQUESTS, {
    variables: { status: "All" },
  });
  const { data: inv, loading: invLoading } = useQuery(INVENTORY);

  const st = stats?.userDashboardStats || {};
  const products = inv?.inventory || inv?.products || [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-2xl ring-1 ring-white/10">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Warehouse Staff Portal</span>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {user?.name || "Staff Member"} 👋
            </h1>
            <p className="max-w-xl text-sm text-slate-300">
              Easily create purchase requests for warehouse stock and track request approvals in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/purchase-requests/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus size={16} />
              <span>New Request</span>
            </Link>

            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5"
            >
              <Boxes size={16} />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <UserStatCard
          to="/purchase-requests"
          label="My Requests"
          value={s ? "—" : st.myRequests}
          icon={ClipboardList}
          accent="from-blue-600 to-indigo-600"
          badgeText="Total requests"
        />
        <UserStatCard
          to="/purchase-requests"
          label="Approved"
          value={s ? "—" : st.approved}
          icon={CheckCircle2}
          accent="from-emerald-500 to-teal-600"
          badgeText="Fulfilled requests"
        />
        <UserStatCard
          to="/purchase-requests"
          label="Pending Review"
          value={s ? "—" : st.pending}
          icon={Clock3}
          accent="from-amber-500 to-orange-500"
          badgeText="Awaiting decision"
        />
        <UserStatCard
          to="/inventory"
          label="Items in Stock"
          value={s ? "—" : st.itemsInStock?.toLocaleString()}
          icon={Boxes}
          accent="from-violet-600 to-purple-600"
          badgeText="Available in warehouse"
        />
      </div>

      {/* Available Warehouse Products */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">Available Warehouse Products</h2>
            <p className="text-xs text-slate-500">Live products catalog stored in the warehouse</p>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            <span>View full catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                {["Product", "Category", "SKU Code", "Location", "Price", "Available Stock", "Status", "Action"].map((x) => (
                  <th key={x} className="px-5 py-3 font-semibold">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invLoading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-slate-400 text-xs">Loading warehouse products...</td>
                </tr>
              ) : (
                products.slice(0, 6).map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                          <Package size={17} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.productName}</p>
                          <p className="text-[11px] text-slate-400">
                            {p.supplier ? `Supplier: ${p.supplier}` : "No supplier"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <Tag className="h-3 w-3 text-slate-400" />
                        {p.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">{p.productCode}</td>

                    <td className="px-5 py-4">
                      {p.warehouseLocation ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-blue-500" />
                          {p.warehouseLocation}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-800">
                      ₹ {p.price?.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 font-extrabold text-emerald-600">
                      {p.quantity} units
                    </td>

                    <td className="px-5 py-4">
                      {p.quantity <= p.minimumStock ? (
                        <span className="badge-amber"><AlertTriangle className="h-3 w-3" /> LOW STOCK</span>
                      ) : (
                        <span className="badge-emerald"><CheckCircle2 className="h-3 w-3" /> IN STOCK</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/purchase-requests/new?productId=${p.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                      >
                        <Plus size={14} />
                        <span>Request</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}

              {!invLoading && products.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-slate-400 text-xs">
                    No products currently available in the warehouse.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Requests Table */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">Recent Purchase Requests</h2>
            <p className="text-xs text-slate-500">Track your submitted purchase requests and current status</p>
          </div>
          <Link to="/purchase-requests" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            <span>View all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                {["Request ID", "Requested Item", "Quantity", "Status", "Submission Date"].map((x) => (
                  <th key={x} className="px-5 py-3 font-semibold">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {r ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-400 text-xs">Loading requests...</td>
                </tr>
              ) : (
                (reqs?.myPurchaseRequests || []).slice(0, 5).map((x) => (
                  <tr key={x.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-bold text-blue-600">{x.requestCode}</td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {x.product?.productName || "Product Removed"}
                      {x.product?.productCode && (
                        <span className="text-xs text-slate-400 font-normal"> ({x.product?.productCode})</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">{x.quantity} units</td>
                    <td className="px-5 py-4"><Badge status={x.status} /></td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(x.createdAt).toLocaleDateString("en-US", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}

              {!r && (reqs?.myPurchaseRequests || []).length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-400 text-xs">
                    No purchase requests submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function UserStatCard({ label, value, icon: Icon, accent, badgeText, to }) {
  return (
    <Link
      to={to}
      className="group card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="font-heading text-2xl font-extrabold text-slate-900">{value}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${accent} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[11px] font-medium text-slate-400">{badgeText}</span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
          View <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

