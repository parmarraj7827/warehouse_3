import { useMutation, useQuery, INVENTORY, CREATE_REQUEST } from "../../services/backend";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

export default function CreatePurchaseRequest() {
  // Used to change pages (e.g., go back, or go to success page)
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const queryProductId = searchParams.get("productId") || "";
  
  // 1. Fetch the list of available inventory items for the dropdown menu
  const { data, loading: productsLoading } = useQuery(INVENTORY);
  
  // 2. Setup the tool to send data back to the server (useMutation)
  const [create, { loading, error }] = useMutation(CREATE_REQUEST);
  
  // Form variables
  const [productId, setProductId] = useState(queryProductId);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const list = data?.inventory || data?.products || [];
    if (queryProductId && list.length && !selectedProduct) {
      const found = list.find((p) => p.id === queryProductId);
      if (found) {
        setProductId(found.id);
        setSelectedProduct(found);
      }
    }
  }, [data, queryProductId]);

  // This function runs when the user clicks "Submit Request"
  const submit = async (e) => {
    // Prevent the page from refreshing when the form is submitted
    e.preventDefault();
    setLocalError("");
    
    // Convert string quantity to a real number
    const q = Number(quantity);
    
    // Basic validation checks before sending to server
    if (!productId) return setLocalError("Product is required.");
    if (!Number.isInteger(q) || q <= 0) return setLocalError("Quantity must be greater than 0.");

    // Check the requested quantity against the current warehouse stock
    const product = (data?.inventory || []).find((p) => p.id === productId);
    if (!product) return setLocalError("Product not found.");

    if (q > product.quantity) {
      const message = `Requested quantity (${q}) is greater than available stock (${product.quantity}) for ${product.productName}.`;
      setLocalError(message);
      window.alert(`Insufficient Stock\n\n${message}\n\nPlease enter a quantity of ${product.quantity} or less.`);
      return;
    }

    try {
      // Actually send the request to the backend!
      await create({
        variables: { input: { productId, quantity: q, reason } },
      });
      // If successful, navigate back to the list page
      nav("/purchase-requests", { replace: true });
    } catch {
      // Errors are handled by the 'error' variable from useMutation
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      
      {/* Back Button */}
      {/* nav(-1) means go back exactly 1 page in browser history */}
      <button
        onClick={() => nav(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={17} /> Back to requests
      </button>

      <div>
        <h1 className="page-title">New Purchase Request</h1>
        <p className="mt-1 muted">Submit a request for a warehouse item</p>
      </div>

      <form onSubmit={submit} className="card p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          
          {/* Dropdown to select product */}
          <div className="sm:col-span-2">
            <label className="label">Product *</label>
            <select
              className="input"
              value={productId}
              onChange={(e) => {
                const id = e.target.value;
                setProductId(id);
                setSelectedProduct((data?.inventory || []).find((p) => p.id === id) || null);
                setLocalError("");
              }}
              disabled={productsLoading}
            >
              <option value="">
                {productsLoading ? "Loading products..." : "Select product"}
              </option>
              {(data?.inventory || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.productCode}) — Available {p.quantity}
                </option>
              ))}
            </select>
          </div>

          {/* Show current stock for the selected product */}
          {selectedProduct && (
            <div className="sm:col-span-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <span className="font-semibold">Available stock:</span> {selectedProduct.quantity}
              {Number(quantity) > selectedProduct.quantity && (
                <span className="ml-2 font-semibold text-red-600">
                  Requested quantity is greater than available stock.
                </span>
              )}
            </div>
          )}

          {/* Number Input for Quantity */}
          <div>
            <label className="label">Quantity *</label>
            <input
              className="input"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>

          {/* Text Input for Reason */}
          <div>
            <label className="label">Reason / Notes</label>
            <input
              className="input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this needed?"
            />
          </div>
        </div>

        {/* Display validation errors from frontend OR backend */}
        {(localError || error) && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {localError || error?.message}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={() => nav(-1)} className="btn-secondary">
            Cancel
          </button>
          {/* Disable button while loading to prevent double-clicks */}
          <button disabled={loading} className="btn-primary">
            {loading ? "Submitting..." : "Submit Request"}
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
