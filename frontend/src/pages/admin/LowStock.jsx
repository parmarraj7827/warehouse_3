import { useQuery, LOW_STOCK } from "../../services/backend";
import { AlertTriangle, Package } from "lucide-react";

export default function LowStock() {
  // Query only the products whose quantity <= their minimumStock setting.
  // We poll every 15 seconds so admins get alerted instantly if stock drops.
  const { data, loading } = useQuery(LOW_STOCK, { pollInterval: 15000 });
  const rows = data?.lowStockProducts || [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="page-title">Low Stock</h1>
        <p className="mt-1 muted">Products at or below their minimum stock level</p>
      </div>

      <section className="card overflow-hidden">
        {/* Alert Banner */}
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
            <AlertTriangle size={19} />
          </div>
          <div>
            <h2 className="font-bold">
              {rows.length} product{rows.length !== 1 ? "s" : ""} need attention
            </h2>
            <p className="text-xs text-slate-400">Rule: quantity ≤ minimum stock</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {["Product", "SKU", "Category", "Quantity", "Minimum", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center">Loading...</td></tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded bg-slate-100">
                          <Package size={15} />
                        </span>
                        {p.productName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{p.productCode}</td>
                    <td className="px-4 py-3.5">{p.category}</td>
                    
                    {/* Highlight the dangerously low quantity in Red */}
                    <td className="px-4 py-3.5 font-bold text-red-600">{p.quantity}</td>
                    
                    <td className="px-4 py-3.5">{p.minimumStock}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                        LOW STOCK
                      </span>
                    </td>
                  </tr>
                ))
              )}
              
              {!loading && !rows.length && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-emerald-600">
                    All products are above minimum stock.
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
