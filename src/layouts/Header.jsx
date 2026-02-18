import { useAuth } from "@/context/AuthContext";
import { UserCircle, LogOut, Bell } from "lucide-react";
import SinarikaLogo from "@/components/ui/SinarikaLogo";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="relative w-full">
      {/* Mimari kenar çizgileri - üst dekoratif çizgi */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
      
      <div className="flex items-center justify-between gap-3 min-w-0 w-full">
        {/* Sol: Logo + Başlık */}
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <SinarikaLogo size="sm" variant="default" />
          <div className="min-w-0 hidden sm:block">
            <h2 className="text-xs font-medium text-gray-500 truncate">Admin Paneli</h2>
          </div>
        </div>

        {/* Sağ: Kullanıcı alanı - modern ikonlar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Bildirim */}
          <button
            aria-label="Bildirimler"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} strokeWidth={2} />
          </button>

          {/* Kullanıcı bilgisi */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <UserCircle size={20} className="text-emerald-600" strokeWidth={2} />
            </div>
            <span
              className="text-xs sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-[180px]"
              title={user?.email}
            >
              {user?.email}
            </span>
          </div>

          {/* Çıkış butonu */}
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 sm:px-4 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-emerald-500/20 active:scale-[0.98]"
          >
            <LogOut size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>

      {/* Alt mimari çizgi */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
    </header>
  );
};

export default Header;
