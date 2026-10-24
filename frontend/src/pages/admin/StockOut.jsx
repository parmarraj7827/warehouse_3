import { useMutation, useQuery, INVENTORY, STOCK_OUT } from "../../services/backend";
import { useState } from "react";
import { ArrowUpFromLine } from "lucide-react";

// We import the reusable form we built in StockIn.jsx!
import { StockForm } from "./StockIn";

export default function StockOut() {
  const { data, loading: pl } = useQuery(INVENTORY);
  
  // Same as StockIn, we need to refresh the stats when this finishes
  const [stockOut, { loading, error }] = useMutation(STOCK_OUT, {
    refetchQueries: ["Inventory", "AdminStats", "Transactions"],
  });

  const [f, setF] = useState({
    productId: "",
    quantity: "",
    customer: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.productId || !Number.isInteger(Number(f.quantity)) || Number(f.quantity) <= 0) {
      return alert("Select a product and enter a quantity greater than 0.");
    }
    
    try {
      await stockOut({
        variables: {
          input: { ...f, quantity: Number(f.quantity), date: new Date(f.date) },
        },
      });
      alert("Stock Out completed successfully.");
      setF({ ...f, quantity: "", notes: "" });
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    // Reusing the 100+ lines of HTML from StockIn by just passing in the data!
    <StockForm
      title="Stock Out"
      subtitle="Dispatch stock from inventory"
      icon={ArrowUpFromLine}
      products={data?.inventory || []}
      loadingProducts={pl}
      f={f}
      change={change}
      submit={submit}
      loading={loading}
      error={error}
      in={false} // This flag tells it to use "Customer" instead of "Supplier"
    />
  );
}
