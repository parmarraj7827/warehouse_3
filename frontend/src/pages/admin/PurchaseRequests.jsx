import { useMutation, useQuery, ALL_REQUESTS, APPROVE_REQUEST, REJECT_REQUEST } from "../../services/backend";
import { Eye, Check, X as XIcon, CheckCircle2, Clock3, XCircle, ShoppingBag, User } from "lucide-react";
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
  
  const { data, loading, refetch } = useQuery(ALL_REQUESTS, {
    variables: { status: tab },
  });

  const [approve, { loading: approving }] = useMutation(APPROVE_REQUEST);
  const [reject, { loading: rejecting }] = useMutation(REJECT_REQUEST);

  const rows = data?.allPurchaseRequests || [];

  const act = async (type, id) => {
    try {
      if (type === "approve") {
        await approve({ variables: { id } });
      } else {
        await reject({ variables: { id } });
      }
      await refetch();
      setSelected(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="page-title">Purchase Requests</h1>
        <p className="mt-1 muted">Review, approve, or decline stock requisition requests</p>
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                {["Request ID", "Requested By", "Product", "Quantity", "Reason", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3.5 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="p-12 text-center text-xs text-slate-400">Loading purchase requests...</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-4 font-mono font-bold text-blue-600">{r.requestCode}</td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                          {r.user?.name?.slice(0, 1) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{r.user?.name}</p>
                          <p className="text-[10px] text-slate-400">{r.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {r.product?.productName || "Product Removed"}
                      {r.product?.productCode && (
                        <span className="block text-[11px] text-slate-400 font-normal">SKU: {r.product?.productCode}</span>
                      )}
                    </td>

                    <td className="px-4 py-4 font-extrabold text-slate-900">{r.quantity} units</td>

                    <td className="max-w-[200px] truncate px-4 py-4 text-xs text-slate-500">{r.reason || "—"}</td>

                    <td className="px-4 py-4 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>

                    <td className="px-4 py-4"><Badge status={r.status} /></td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(r)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                          title="View Request"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {r.status === "PENDING" && (
                          <>
                            <button
                              disabled={approving}
                              onClick={() => act("approve", r.id)}
                              className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                              title="Approve Request"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              disabled={rejecting}
                              onClick={() => act("reject", r.id)}
                              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                              title="Reject Request"
                            >
                              <XIcon size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && !rows.length && (
                <tr><td colSpan="8" className="p-12 text-center text-xs text-slate-400">No purchase requests found in this tab.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Purchase Request Details">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Request Code</p>
              <h3 className="font-heading text-lg font-bold text-blue-600">{selected?.requestCode}</h3>
            </div>
            <Badge status={selected?.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <Info label="Requester" value={selected?.user?.name} />
            <Info label="Email Address" value={selected?.user?.email} />
            <Info label="Product" value={selected?.product ? `${selected.product.productName} (${selected.product.productCode})` : "Product Removed"} />
            <Info label="Quantity Requested" value={`${selected?.quantity} units`} />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reason / Purpose</p>
            <p className="mt-1 text-slate-700 whitespace-pre-wrap">{selected?.reason || "No notes provided."}</p>
          </div>

          {selected?.status === "PENDING" && (
            <div className="flex justify-end gap-3 pt-2">
              <button disabled={rejecting} onClick={() => act("reject", selected.id)} className="btn-secondary text-rose-600">
                Reject Request
              </button>
              <button disabled={approving} onClick={() => act("approve", selected.id)} className="btn-primary">
                Approve & Dispatch Stock
              </button>
            </div>
          )}
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

