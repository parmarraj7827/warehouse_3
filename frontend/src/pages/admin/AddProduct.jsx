import { useMutation, CREATE_PRODUCT } from "../../services/backend";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
const init = {
  productName: "",
  productCode: "",
  category: "Electronics",
  price: "",
  quantity: "",
  supplier: "",
  minimumStock: "5",
  warehouseLocation: "",
};
export default function AddProduct() {
  const nav = useNavigate();
  const [f, setF] = useState(init);
  const [create, { loading, error }] = useMutation(CREATE_PRODUCT);
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!f.productName || !f.productCode)
      return alert("Product name and product code are required.");
    if (
      [f.price, f.quantity, f.minimumStock].some(
        (x) => Number(x) < 0 || x === "",
      )
    )
      return alert(
        "Price, quantity and minimum stock must be valid non-negative values.",
      );
    try {
      await create({
        variables: {
          input: {
            ...f,
            price: Number(f.price),
            quantity: Number(f.quantity),
            minimumStock: Number(f.minimumStock),
          },
        },
      });
      nav("/admin/products");
    } catch (e) {
      alert(e.message);
    }
  };
  return (
    <Form
      title="Add Product"
      subtitle="Create a new product"
      f={f}
      change={change}
      submit={submit}
      loading={loading}
      error={error}
      onCancel={() => nav("/admin/products")}
    />
  );
}
function Form({
  title,
  subtitle,
  f,
  change,
  submit,
  loading,
  error,
  onCancel,
  edit = false,
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={17} /> Products
      </button>
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="mt-1 muted">{subtitle}</p>
      </div>
      <form onSubmit={submit} className="card p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Product Name *"
            name="productName"
            value={f.productName}
            onChange={change}
            placeholder="Enter product name"
          />
          <Field
            label="Product Code *"
            name="productCode"
            value={f.productCode}
            onChange={change}
            placeholder="e.g. LAP001"
          />
          <div>
            <label className="label">Category *</label>
            <select
              name="category"
              className="input"
              value={f.category}
              onChange={change}
            >
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Office Supplies</option>
              <option>Other</option>
            </select>
          </div>
          <Field
            label="Price *"
            name="price"
            type="number"
            min="0"
            value={f.price}
            onChange={change}
            placeholder="0"
          />
          <Field
            label="Supplier"
            name="supplier"
            value={f.supplier}
            onChange={change}
            placeholder="Supplier name"
          />
          <Field
            label="Warehouse Location"
            name="warehouseLocation"
            value={f.warehouseLocation}
            onChange={change}
            placeholder="Example: A-101"
          />
          <Field
            label="Minimum Stock *"
            name="minimumStock"
            type="number"
            min="0"
            value={f.minimumStock}
            onChange={change}
            placeholder="5"
          />
          {!edit && (
            <Field
              label="Initial Stock *"
              name="quantity"
              type="number"
              min="0"
              value={f.quantity}
              onChange={change}
              placeholder="0"
            />
          )}
        </div>
        {edit && (
          <p className="mt-5 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            Quantity is controlled through Stock In / Stock Out to preserve
            transaction history.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error.message}
          </p>
        )}
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button disabled={loading} className="btn-primary">
            {loading
              ? edit
                ? "Updating..."
                : "Creating..."
              : edit
                ? "Update Product"
                : "Save Product"}
            <Save size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
function Field({ label, name, value, onChange, type = "text", ...rest }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  );
}
export { Form, Field };
