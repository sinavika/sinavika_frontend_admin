import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import Categories from "@/pages/admin/Categories";
import Lessons from "@/pages/admin/Lessons";
import Coupons from "@/pages/admin/Coupons";
import References from "@/pages/admin/References";
import SubscriptionPackages from "@/pages/admin/SubscriptionPackages";
import Publishers from "@/pages/admin/Publishers";
import Booklets from "@/pages/admin/Booklets";
import Exams from "@/pages/admin/Exams";
import Score from "@/pages/admin/Score";
import Students from "@/pages/admin/Students";
import StudentDetail from "@/pages/admin/StudentDetail";
import AdminRouteWrapper from "@/components/AdminRouteWrapper";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
          {/* 🔐 Login */}
          <Route path="/login" element={<Login />} />

          {/* 🧭 Admin korumalı alan - girişte / → login veya dashboard */}
          <Route path="/" element={<AdminRouteWrapper />}>
            <Route index element={<Navigate to="/admin/categories" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin/categories" element={<Categories />} />
            <Route path="admin/score" element={<Score />} />
            <Route path="admin/students" element={<Students />} />
            <Route path="admin/students/:studentId" element={<StudentDetail />} />
            <Route path="admin/lessons" element={<Lessons />} />
            <Route path="admin/exams" element={<Exams />} />
            <Route path="admin/booklets" element={<Booklets />} />
            <Route path="admin/coupons" element={<Coupons />} />
            <Route path="admin/references" element={<References />} />
            <Route path="admin/subscription-packages" element={<SubscriptionPackages />} />
            <Route path="admin/publishers" element={<Publishers />} />

            {/* Yetkisiz erişim */}
            <Route
              path="/unauthorized"
              element={<div className="p-4 sm:p-6 md:p-10 text-red-500 text-center">Yetkisiz Erişim</div>}
            />
          </Route>
        </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
