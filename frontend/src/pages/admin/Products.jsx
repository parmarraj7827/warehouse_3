import { useMutation, useQuery, PRODUCTS, DELETE_PRODUCT } from "../../services/backend";
import { Link } from "react-router-dom";
import { Search, Plus, Edit3, Trash2, Eye, Package, Tag, MapPin, Building2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Modal from "../../components/Modal";

const StatusBadge = ({ status }) => (
  status === "inactive" ? (
    <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
      INACTIVE
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
      ACTIVE
    </span>
  )
);

const StockBadge = ({ status }) => (
  status === "LOW STOCK" ? (
    <span className="badge-amber">
      <AlertTriangle className="h-3 w-3" />
      LOW STOCK
    </span>
  ) : (
    <span className="badge-emerald">
      <CheckCircle2 className="h-3 w-3" />
      IN STOCK
    </span>
  )
);
export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const { data, loading, refetch } = useQuery(PRODUCTS, {
    variables: { search, category },
  });

  const [del, { loading: deleting }] = useMutation(DELETE_PRODUCT);

  const rows = data?.products || [];
  const cats = [...new Set(rows.map((x) => x.category))];

  const remove = async () => {
    if (!selected) return;
    try {
      await del({ variables: { id: selected.id } });
      setSelected(null);
      refetch();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Products Catalog</h1>
          <p className="mt-1 muted">Manage warehouse inventory, prices, SKUs, and locations</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary shrink-0">
          <Plus size={18} />
          <span>Add New Product</span>
        </Link>
      </div>

      <section className="card overflow-hidden">
        {/* Filter Bar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center bg-slate-50/50">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search by product name or SKU code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input sm:w-52" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                {[
                    "#",
                    "Product Name",
                    "Category",
                    "SKU Code",
                    "Location",
                    "Stock",
                    "Stock Level",
                    "Price",
                    "Status",
                    "Actions"
                  ].map((h) => (
                    <th key={h} className="px-4 py-3.5 font-bold">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="10" className="p-12 text-center text-xs text-slate-400">Loading catalog items...</td></tr>
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
                          <p className="text-[11px] text-slate-400">{p.supplier ? `Supplier: ${p.supplier}` : "No supplier"}</p>
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

                    <td className="px-4 py-4 font-extrabold text-slate-900">
                      {p.quantity}
                    </td>

                    <td className="px-4 py-4">
                      <StockBadge status={p.stockStatus} />
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-800">
                      ₹ {p.price?.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(p)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Edit product"
                        >
                          <Edit3 size={16} />
                        </Link>
                        
                        <button 
                          onClick={() => setSelected({ ...p, confirmDelete: true })}
                          className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && !rows.length && (
                <tr><td colSpan="10" className="p-12 text-center text-xs text-slate-400">No products found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* View Product Modal */}
      <Modal
        open={!!selected && !selected.confirmDelete}
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
              <p className="text-xs text-slate-400">SKU: <span className="font-mono font-bold text-slate-700">{selected?.productCode}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <Info label="Category" value={selected?.category} />
            <Info label="Price" value={`₹ ${selected?.price?.toLocaleString("en-IN")}`} />
            <Info label="Current Stock" value={`${selected?.quantity} units`} />
            <Info label="Minimum Stock Level" value={`${selected?.minimumStock} units`} />
            <Info label="Supplier" value={selected?.supplier || "—"} />
            <Info label="Warehouse Location" value={selected?.warehouseLocation || "Not Assigned"} />
            <Info label="Status" value={selected?.status} />
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        open={!!selected?.confirmDelete}
        onClose={() => setSelected(null)}
        title="Delete Product Confirmation"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-rose-50 p-4 border border-rose-100 text-rose-800 text-xs">
            <p className="font-bold">Warning: This action cannot be undone.</p>
            <p className="mt-1 text-rose-600">Deleting this product will remove its catalog entry and associated history logs.</p>
          </div>

          <p className="text-xs text-slate-600">Product to delete:</p>
          <p className="font-bold text-slate-900 text-sm">{selected?.productName} ({selected?.productCode})</p>
          
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
            <button disabled={deleting} onClick={remove} className="btn-danger">
              {deleting ? "Deleting..." : "Confirm Delete"}
              <Trash2 size={16} />
            </button>
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

