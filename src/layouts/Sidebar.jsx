import {
  LayoutDashboard,
  FolderTree,
  ChevronLeft,
  ChevronDown,
  BookOpen,
  Database,
  FileCheck,
  LayoutTemplate,
  Tag,
  Building2,
  Users,
  CreditCard,
} from "lucide-react";
import SinarLabLogo from "@/components/ui/SinarLabLogo";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const menuSections = [
  {
    title: "Genel",
    items: [
      { icon: LayoutDashboard, label: "Kontrol Paneli", path: "/dashboard" },
      { icon: FolderTree, label: "Kategoriler", path: "/admin/categories" },
    ],
  },
  {
    title: "Eğitim",
    items: [
      { icon: FileCheck, label: "Sınavlar", path: "/admin/exams" },
      { icon: BookOpen, label: "Dersler", path: "/admin/lessons" },
      { icon: Database, label: "Soru Havuzu", path: "/admin/question-pool" },
      { icon: LayoutTemplate, label: "Soru Şablonları", path: "/admin/question-templates" },
    ],
  },
  {
    title: "Pazarlama",
    items: [
      { icon: Tag, label: "Kuponlar", path: "/admin/coupons" },
      { icon: Users, label: "Referral Kampanyaları", path: "/admin/referral-campaigns" },
    ],
  },
  {
    title: "İşletme",
    items: [
      { icon: CreditCard, label: "Abonelik Paketleri", path: "/admin/subscription-packages" },
      { icon: Building2, label: "Yayınevleri", path: "/admin/publishers" },
    ],
  },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(
    menuSections.reduce((acc, s) => ({ ...acc, [s.title]: true }), {})
  );

  const toggleSection = (title) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNav = (path) => {
    if (path) navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => path && location.pathname === path;

  return (
    <>
      {/* Masaüstü Sidebar */}
      <aside
        className={[
          "hidden lg:flex fixed top-0 left-0 h-screen z-50 bg-slate-900 text-white shadow-xl transition-all duration-300",
          collapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        <div className="flex flex-col w-full">
          {/* Üst bar - SınavLab logosu */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/80">
            <SinarLabLogo size="sm" variant="dark" iconOnly={collapsed} />
            <button
              className="h-8 w-8 rounded-lg hover:bg-slate-700/80 grid place-items-center transition-colors"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            >
              <ChevronLeft
                size={18}
                className={["text-emerald-400 transition-transform", collapsed ? "rotate-180" : ""].join(" ")}
              />
            </button>
          </div>

          {/* Menü bölümleri */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-4">
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-2 py-1.5 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {section.title}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${expandedSections[section.title] ? "" : "-rotate-90"}`}
                    />
                  </button>
                )}
                {(!collapsed ? expandedSections[section.title] : true) && (
                  <ul className="space-y-0.5">
                    {section.items.map(({ icon: Icon, label, path }) => (
                      <li key={label}>
                        <button
                          onClick={() => handleNav(path)}
                          className={[
                            "w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-200",
                            isActive(path)
                              ? "bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-400 -ml-0.5 pl-3"
                              : "hover:bg-slate-700/60 text-slate-300 hover:text-white",
                          ].join(" ")}
                          title={collapsed ? label : undefined}
                        >
                          <Icon size={18} className="shrink-0 text-emerald-400" strokeWidth={2} />
                          {!collapsed && <span className="truncate text-sm">{label}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobil Sidebar */}
      <aside
        className={[
          "lg:hidden fixed inset-y-0 left-0 z-50 bg-slate-900 text-white shadow-xl w-64 transform transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between h-16 border-b border-slate-700/80 px-4">
          <SinarLabLogo size="sm" variant="dark" />
          <button
            className="min-h-[44px] min-w-[44px] rounded-lg hover:bg-slate-700/80 grid place-items-center touch-manipulation"
            onClick={() => setMobileOpen(false)}
            aria-label="Menüyü kapat"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29 10.59 10.6 16.89 4.3z" />
            </svg>
          </button>
        </div>

        <nav className="px-4 py-4 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-4">
              <div className="px-2 py-1.5 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {section.items.map(({ icon: Icon, label, path }) => (
                  <li key={label}>
                    <button
                      onClick={() => handleNav(path)}
                      className={[
                        "w-full flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-lg transition-colors touch-manipulation",
                        isActive(path)
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "hover:bg-slate-700/60 text-slate-300",
                      ].join(" ")}
                    >
                      <Icon size={18} className="text-emerald-400" strokeWidth={2} />
                      <span className="truncate text-sm">{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
