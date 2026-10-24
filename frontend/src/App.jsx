import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components & Layouts
import ProtectedRoute from "./components/ProtectedRoute";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Authentication Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import Inventory from "./pages/user/Inventory";
import UserRequests from "./pages/user/PurchaseRequests";
import CreateRequest from "./pages/user/CreatePurchaseRequest";
import UserProfile from "./pages/user/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import StockIn from "./pages/admin/StockIn";
import StockOut from "./pages/admin/StockOut";
import LowStock from "./pages/admin/LowStock";
import AdminUsers from "./pages/admin/Users";
import AdminRequests from "./pages/admin/PurchaseRequests";
import AdminProfile from "./pages/admin/Profile";

// ==========================================
// HOME COMPONENT (Routing Helper)
// This decides where to send the user when they visit the main '/' URL.
// ==========================================
function Home() {
  const { user, loading } = useAuth();
  
  // Wait until we know if the user is logged in or not
  if (loading) return null;
  
  // If no user is logged in, send them to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If an admin is logged in, send them to the admin dashboard.
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  
  // Otherwise, they are a normal user, send them to the user dashboard.
  return <Navigate to="/dashboard" replace />;
}

// ==========================================
// MAIN APP COMPONENT
// This sets up all the URLs (routes) in our application
// ==========================================
export default function App() {
  return (
    <Routes>
      {/* Public Routes (Anyone can visit these) */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* ======================================= */}
      {/* USER ROUTES */}
      {/* ProtectedRoute ensures only people with role="user" can enter */}
      {/* ======================================= */}
      <Route element={<ProtectedRoute role="user" />}>
        {/* UserLayout gives these pages the standard User Sidebar and Navbar */}
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/products" element={<Inventory />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/purchase-requests" element={<UserRequests />} />
          <Route path="/purchase-requests/new" element={<CreateRequest />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Route>
      
      {/* ======================================= */}
      {/* ADMIN ROUTES */}
      {/* ProtectedRoute ensures only people with role="admin" can enter */}
      {/* ======================================= */}
      <Route element={<ProtectedRoute role="admin" />}>
        {/* AdminLayout gives these pages the standard Admin Sidebar and Navbar */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/products/new" element={<AddProduct />} />
          <Route path="/admin/products/:id/edit" element={<EditProduct />} />
          <Route path="/admin/stock-in" element={<StockIn />} />
          <Route path="/admin/stock-out" element={<StockOut />} />
          <Route path="/admin/low-stock" element={<LowStock />} />
          <Route path="/admin/purchase-requests" element={<AdminRequests />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>
      
      {/* Catch-all route: If they type a random URL, send them Home */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
