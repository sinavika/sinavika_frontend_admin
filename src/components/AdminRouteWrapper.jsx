import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/layouts/AdminLayout";

const AdminRouteWrapper = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-gray-700">Yükleniyor...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "Admin") return <Navigate to="/unauthorized" replace />;

  // Eğer istersen şunu da ekleyebilirsin:
  // if (!user.subscriptionActive) return <Navigate to="/subscription-required" replace />;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRouteWrapper;
