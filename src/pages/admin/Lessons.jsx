import { BookOpen } from "lucide-react";

const Lessons = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <BookOpen size={24} className="text-emerald-500" />
          Dersler
        </h1>
      </div>
      <div className="admin-card p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-600">İçerik yönetimi burada yer alacak.</p>
      </div>
    </div>
  );
};

export default Lessons;
