import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import Categories from "@/pages/admin/Categories";
import Lessons from "@/pages/admin/Lessons";
import Coupons from "@/pages/admin/Coupons";
import ReferralCampaigns from "@/pages/admin/ReferralCampaigns";
import SubscriptionPackages from "@/pages/admin/SubscriptionPackages";
import Publishers from "@/pages/admin/Publishers";
import QuestionPool from "@/pages/admin/QuestionPool";
import QuestionTemplates from "@/pages/admin/QuestionTemplates";
import Exams from "@/pages/admin/Exams";
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
            <Route path="admin/lessons" element={<Lessons />} />
            <Route path="admin/exams" element={<Exams />} />
            <Route path="admin/question-pool" element={<QuestionPool />} />
            <Route path="admin/question-templates" element={<QuestionTemplates />} />
            <Route path="admin/coupons" element={<Coupons />} />
            <Route path="admin/referral-campaigns" element={<ReferralCampaigns />} />
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
