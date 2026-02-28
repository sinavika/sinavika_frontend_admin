import { useState, useEffect } from "react";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import SinarikaLogo from "@/components/ui/SinarikaLogo";

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);     // masaüstü için
  const [mobileOpen, setMobileOpen] = useState(false);   // mobil için

  // Esc ile mobil menüyü kapat
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="bg-admin-bg min-h-screen">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* İçerik alanı */}
      <div
        className={[
          "transition-all duration-300 flex flex-col min-h-screen",
          // Masaüstü sol boşluk (collapsed durumuna göre)
          collapsed ? "lg:ml-20" : "lg:ml-64",
          // Mobilde overlay açıkken scroll’u kilitle
          mobileOpen ? "overflow-hidden" : "",
        ].join(" ")}
      >
        {/* Üst bar: Header + mobilde hamburger — mobil uyumlu yükseklik ve hiyerarşi */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-h-[56px] sm:min-h-[64px] py-2 pl-2 pr-2 sm:pl-4 sm:pr-4 lg:pl-6 lg:pr-6 relative overflow-hidden">
            {/* Dekoratif sol kenar vurgusu - mimari çizgi */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 opacity-90 rounded-r" />
            {/* Mobil: hamburger */}
            <button
              className="lg:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
              onClick={() => setMobileOpen((x) => !x)}
              aria-label="Menüyü Aç/Kapat"
            >
              {/* Basit hamburger ikonu (svg) */}
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" />
              </svg>
            </button>

            {/* Header (var olan bileşen) */}
            <div className="flex-1">
              <Header />
            </div>

            {/* Masaüstü: collapse toggle */}
            <button
              className="hidden lg:inline-flex items-center justify-center h-9 px-3 rounded-md border border-gray-200 text-sm bg-white hover:bg-gray-50"
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Sidebar'ı Daralt/Genişlet"
              title={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            >
              {collapsed ? "Genişlet" : "Daralt"}
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <SinarikaLogo size="sm" variant="default" />
            <span>© {new Date().getFullYear()} Sınavika — Tüm hakları saklıdır</span>
          </div>
        </footer>
      </div>

      {/* Mobil açıkken karartma alanı */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
