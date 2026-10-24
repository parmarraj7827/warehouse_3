import { useQuery, PRODUCT, updateProductAPI } from "../../services/backend";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form } from "./AddProduct";
export default function EditProduct() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data, loading: fetching } = useQuery(PRODUCT, { variables: { id } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [f, setF] = useState(null);
  useEffect(() => {
    if (data?.product) {
      const p = data.product;
      setF({
        productName: p.productName,
        productCode: p.productCode,
        category: p.category,
        price: String(p.price),
        supplier: p.supplier || "",
        minimumStock: String(p.minimumStock),
        warehouseLocation: p.warehouseLocation || "",
         status: p.status || "active",
      });
    }
  }, [data]);
  if (fetching || !f)
    return (
      <div className="p-10 text-center text-slate-500">Loading product...</div>
    );
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateProductAPI(id, {
        productName: f.productName,
        productCode: f.productCode,
        category: f.category,
        price: Number(f.price),
        supplier: f.supplier,
        minimumStock: Number(f.minimumStock),
        warehouseLocation: f.warehouseLocation,
         status: f.status
      });
      nav("/admin/products");
    } catch (e) {
      setError(e?.message ? e : { message: String(e) });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form
      title="Edit Product"
      subtitle="Update product information"
      f={f}
      change={change}
      submit={submit}
      loading={loading}
      error={error}
      onCancel={() => nav("/admin/products")}
      edit
    />
  );
}
