import { useMutation, useQuery, INVENTORY, STOCK_IN } from "../../services/backend";
import { useState } from "react";
import { ArrowDownToLine, Save } from "lucide-react";

export default function StockIn() {
  const { data, loading: pl } = useQuery(INVENTORY);
  
  // When a Stock In transaction happens, we need to refresh a LOT of things 
  // on the backend to keep the dashboard numbers accurate. 
  // We use refetchQueries to automatically trigger those refreshes!
  const [stockIn, { loading, error }] = useMutation(STOCK_IN, {
    refetchQueries: ["Inventory", "AdminStats", "Transactions"],
  });

  // The form state
  const [f, setF] = useState({
    productId: "",
    quantity: "",
    supplier: "",
    // Set the date to today by default (YYYY-MM-DD format)
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  // A generic way to handle multiple input changes
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    
    // Make sure they selected a product and typed a valid number
    if (!f.productId || !Number.isInteger(Number(f.quantity)) || Number(f.quantity) <= 0) {
      return alert("Select a product and enter a quantity greater than 0.");
    }

    try {
      await stockIn({
        variables: {
          input: { ...f, quantity: Number(f.quantity), date: new Date(f.date) },
        },
      });
      alert("Stock In completed successfully.");
      // Clear the form, but keep the date and product selected
      setF({ ...f, quantity: "", notes: "" });
    } catch (e) {
      alert(e.message);
    }
  };

  // We built a reusable <StockForm /> component because "Stock In" and "Stock Out"
  // look exactly the same! This prevents us from repeating 100 lines of code.
  return (
    <StockForm
      title="Stock In"
      subtitle="Add stock to an existing product"
      icon={ArrowDownToLine}
      products={data?.inventory || []}
      loadingProducts={pl}
      f={f}
      change={change}
      submit={submit}
      loading={loading}
      error={error}
      in={true} // Tells the form this is an "Incoming" transaction
    />
  );
}

// ==========================================
// REUSABLE STOCK FORM COMPONENT
// ==========================================
export function StockForm({
  title, subtitle, icon: Icon, products, loadingProducts,
  f, change, submit, loading, error, in: incoming,
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="mt-1 muted">{subtitle}</p>
      </div>

      <form onSubmit={submit} className="card p-5 sm:p-7">
        
        {/* Informational Blue Banner */}
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-blue-700">
          <div className="rounded-lg bg-white p-2">
            <Icon size={20} />
          </div>
          <p className="text-sm font-semibold">
            {incoming
              ? "Increase product quantity and record the movement."
              : "Decrease quantity without allowing negative stock."}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Product *</label>
            <select name="productId" className="input" value={f.productId} onChange={change}>
              <option value="">
                {loadingProducts ? "Loading products..." : "Select product"}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.productCode}) — Current {p.quantity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Quantity *</label>
            <input
              name="quantity"
              type="number" min="1" step="1"
              className="input"
              value={f.quantity} onChange={change}
            />
          </div>

          <div>
            {/* If StockIn, ask for Supplier. If StockOut, ask for Customer */}
            <label className="label">{incoming ? "Supplier" : "Customer"}</label>
            <input
              name={incoming ? "supplier" : "customer"}
              className="input"
              value={incoming ? f.supplier || "" : f.customer || ""}
              onChange={change}
              placeholder={incoming ? "Supplier name" : "Customer name"}
            />
          </div>

          <div>
            <label className="label">Date *</label>
            <input name="date" type="date" className="input" value={f.date} onChange={change} />
          </div>

          <div>
            <label className="label">Notes</label>
            <input name="notes" className="input" value={f.notes} onChange={change} placeholder="Optional notes" />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error.message}</p>
        )}

        <div className="mt-7 flex justify-end">
          <button disabled={loading} className="btn-primary">
            {loading ? "Processing..." : "Process Stock"}
            <Save size={16} />
          </button>
        </div>

      </form>
    </div>
  );
}
