import { useMutation, useQuery, USERS, SET_ACTIVE, UPDATE_ROLE } from "../../services/backend";
import { ShieldCheck, UserCheck, UserX } from "lucide-react";

export default function Users() {
  // 1. Fetch all users
  const { data, loading, refetch } = useQuery(USERS);
  
  // 2. Setup mutations for Admin actions
  const [active, { loading: busy }] = useMutation(SET_ACTIVE);
  const [role, { loading: roleBusy }] = useMutation(UPDATE_ROLE);
  
  const rows = data?.users || [];

  // Toggle whether an account is Active or Disabled
  const toggle = async (u) => {
    try {
      await active({ variables: { id: u.id, isActive: !u.isActive } });
      refetch();
    } catch (e) {
      alert(e.message);
    }
  };

  // Change user role from 'user' to 'admin' (and vice-versa)
  const changeRole = async (u) => {
    const next = u.role === "admin" ? "user" : "admin";
    
    // JavaScript built-in confirmation popup!
    if (!confirm(`Change ${u.name}'s role to ${next}?`)) return;
    
    try {
      await role({ variables: { id: u.id, role: next } });
      refetch();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="page-title">Users</h1>
        <p className="mt-1 muted">Manage user accounts and roles</p>
      </div>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {["User", "Phone", "Role", "Status", "Created Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center">Loading users...</td></tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id}>
                    
                    {/* User Profile Column */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {u.name.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3.5">{u.phone || "—"}</td>
                    
                    {/* Role Button (Admin / User) */}
                    <td className="px-4 py-3.5">
                      <button
                        disabled={roleBusy}
                        onClick={() => changeRole(u)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
                          u.role === "admin" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        <ShieldCheck size={12} />
                        {u.role}
                      </button>
                    </td>

                    {/* Account Status Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                        u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    {/* Disable/Enable Action Button */}
                    <td className="px-4 py-3.5">
                      <button
                        disabled={busy}
                        onClick={() => toggle(u)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                          u.isActive 
                          ? "border-red-100 text-red-600 hover:bg-red-50" 
                          : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {u.isActive ? (
                          <><UserX size={14} /> Deactivate</>
                        ) : (
                          <><UserCheck size={14} /> Activate</>
                        )}
                      </button>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
