import { useQuery, INVENTORY, PRODUCTS } from "../../services/backend";
import { Search, Package, MapPin, Tag, Plus, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Modal from "../../components/Modal";

// Helper component to show colored tags
const Badge = ({ status }) => (
  status === "LOW STOCK" ? (
    <span className="badge-amber"><AlertTriangle className="h-3 w-3" /> LOW STOCK</span>
  ) : (
    <span className="badge-emerald"><CheckCircle2 className="h-3 w-3" /> IN STOCK</span>
  )
);

export default function Inventory() {
  const location = useLocation();
  const isProductsView = location.pathname.includes("products");

  // State for search and category filter
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  // Fetch products / inventory from the backend.
  const { data, loading, error, refetch } = useQuery(INVENTORY, {
    variables: { search, category },
  });

  // Extract rows safely (both inventory and products are supported)
  const rows = data?.inventory || data?.products || [];
  
  // Create a unique list of categories for the dropdown menu
  const cats = [...new Set(rows.map((x) => x.category).filter(Boolean))];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">{isProductsView ? "Products Catalog" : "Warehouse Inventory"}</h1>
          <p className="mt-1 muted">
            {isProductsView 
              ? "Browse all warehouse products, specifications, locations, and request items" 
              : "View real-time inventory stock levels and submit purchase requests"}
          </p>
        </div>
        <Link to="/purchase-requests/new" className="btn-primary shrink-0">
          <Plus size={18} />
          <span>New Purchase Request</span>
        </Link>
      </div>

      <section className="card overflow-hidden">
        {/* ========================================== */}
        {/* FILTER BAR (Search & Dropdown)             */}
        {/* ========================================== */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center bg-slate-50/50">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search by product name, SKU, or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Category Dropdown */}
          <select
            className="input sm:w-52"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* ========================================== */}
        {/* TABLE                                      */}
        {/* ========================================== */}
        {error ? (
          <div className="p-8 text-center text-rose-600">
            <p className="font-semibold">Unable to load products.</p>
            <button onClick={refetch} className="btn-secondary mt-3">Try Again</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="table-head">
                <tr>
                  {["#", "Product Name", "Category", "SKU Code", "Location", "Price", "Available", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3.5 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* IF LOADING */}
                {loading ? (
                  <tr>
                    <td colSpan="9" className="p-12 text-center text-xs text-slate-400">Loading products catalog...</td>
                  </tr>
                ) : (
                  rows.map((p, i) => (
                    <tr key={p.id} className="table-row">
                      <td className="px-4 py-4 text-xs font-bold text-slate-400">{i + 1}</td>

                      <td className="px-4 py-4">
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

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          <Tag className="h-3 w-3 text-slate-400" />
                          {p.category}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-mono text-xs font-bold text-slate-700">{p.productCode}</td>

                      <td className="px-4 py-4">
                        {p.warehouseLocation ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            {p.warehouseLocation}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-800">
                        ₹ {p.price?.toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-4 font-extrabold text-emerald-600">
                        {p.quantity} units
                      </td>

                      <td className="px-4 py-4"><Badge status={p.status} /></td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(p)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>

                          <Link
                            to={`/purchase-requests/new?productId=${p.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                            title="Request this product"
                          >
                            <Plus size={14} />
                            <span>Request</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {/* IF EMPTY */}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-12 text-center text-xs text-slate-400">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* View Product Details Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Product Details"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Package size={24} />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">{selected?.productName}</h3>
              <p className="text-xs text-slate-400">
                SKU: <span className="font-mono font-bold text-slate-700">{selected?.productCode}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <Info label="Category" value={selected?.category} />
            <Info label="Price" value={`₹ ${selected?.price?.toLocaleString("en-IN")}`} />
            <Info label="Available Stock" value={`${selected?.quantity} units`} />
            <Info label="Minimum Stock Level" value={`${selected?.minimumStock} units`} />
            <Info label="Supplier" value={selected?.supplier || "—"} />
            <Info label="Warehouse Location" value={selected?.warehouseLocation || "Not Assigned"} />
            <Info label="Status" value={selected?.status} />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
            <Link
              to={`/purchase-requests/new?productId=${selected?.id}`}
              className="btn-primary"
            >
              <Plus size={16} />
              <span>Request Product</span>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-800">{value || "—"}</p>
    </div>
  );
}
