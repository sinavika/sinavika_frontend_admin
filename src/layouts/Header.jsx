import { useAuth } from "@/context/AuthContext";
import { UserCircle, LogOut, Bell } from "lucide-react";
import SinarikaLogo from "@/components/ui/SinarikaLogo";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="relative w-full">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0 w-full py-1">
        {/* Sol: Logo + Ana başlık (her zaman görünür, mobilde hiyerarşi net) */}
        <div className="min-w-0 flex-1 flex items-center gap-2 sm:gap-4">
          <SinarikaLogo size="sm" variant="default" className="shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 truncate">
              Admin Paneli
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">
              Sınavika yönetim merkezi
            </p>
          </div>
        </div>

        {/* Sağ: Bildirim + Kullanıcı + Çıkış */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            aria-label="Bildirimler"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
          >
            <Bell size={18} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <UserCircle size={20} className="text-emerald-600" strokeWidth={2} />
            </div>
            <span
              className="text-[11px] sm:text-sm text-slate-600 truncate max-w-[100px] sm:max-w-[180px]"
              title={user?.email}
            >
              {user?.email}
            </span>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 sm:px-4 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-emerald-500/20 active:scale-[0.98] min-h-[40px] sm:min-h-0"
          >
            <LogOut size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
    </header>
  );
};

export default Header;
