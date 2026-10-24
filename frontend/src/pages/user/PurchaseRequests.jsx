import { useQuery, MY_REQUESTS } from "../../services/backend";
import { Link } from "react-router-dom";
import { Eye, Plus, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useState } from "react";
import Modal from "../../components/Modal";

const Badge = ({ status }) => {
  if (status === "APPROVED") {
    return <span className="badge-emerald"><CheckCircle2 className="h-3 w-3" /> APPROVED</span>;
  }
  if (status === "PENDING") {
    return <span className="badge-amber"><Clock3 className="h-3 w-3" /> PENDING</span>;
  }
  return <span className="badge-rose"><XCircle className="h-3 w-3" /> REJECTED</span>;
};

export default function PurchaseRequests() {
  const [tab, setTab] = useState("All");
  const [selected, setSelected] = useState(null);

  const { data, loading } = useQuery(MY_REQUESTS, {
    variables: { status: tab },
  });

  const rows = data?.myPurchaseRequests || [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">My Purchase Requests</h1>
          <p className="mt-1 muted">Submit new requests for warehouse items and track approval status</p>
        </div>
        <Link to="/purchase-requests/new" className="btn-primary shrink-0">
          <Plus size={18} />
          <span>New Purchase Request</span>
        </Link>
      </div>

      <section className="card overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-100 p-3 bg-slate-50/50 overflow-x-auto">
          {["All", "Pending", "Approved", "Rejected"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                tab === t
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
              }`}
            >
              {t} Requests
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                {["Request ID", "Requested Item", "Quantity", "Status", "Date Submitted", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3.5 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-xs text-slate-400">Loading your purchase requests...</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-4 font-mono font-bold text-blue-600">{r.requestCode}</td>
                    
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {r.product?.productName || "Product Removed"}{" "}
                      {r.product?.productCode && (
                        <span className="text-xs text-slate-400 font-normal">({r.product?.productCode})</span>
                      )}
                    </td>

                    <td className="px-4 py-4 font-extrabold text-slate-900">{r.quantity} units</td>

                    <td className="px-4 py-4"><Badge status={r.status} /></td>

                    <td className="px-4 py-4 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelected(r)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                        title="View request details"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan="6" className="p-12 text-center text-xs text-slate-400">No requests found in this tab.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Details Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Purchase Request Details"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Request ID</p>
              <h3 className="font-heading text-lg font-bold text-blue-600">{selected?.requestCode}</h3>
            </div>
            <Badge status={selected?.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <Info label="Item Requested" value={selected?.product?.productName || "Product Removed"} />
            <Info label="Product Code" value={selected?.product?.productCode || "—"} />
            <Info label="Quantity Requested" value={`${selected?.quantity} units`} />
            <Info label="Date Submitted" value={selected?.createdAt ? new Date(selected.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reason / Notes</p>
            <p className="mt-1 text-slate-700 whitespace-pre-wrap">{selected?.reason || "No notes provided."}</p>
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

